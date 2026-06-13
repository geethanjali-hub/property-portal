"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';
import PropertyCard from '@/components/PropertyCard';
import { 
  Search, SlidersHorizontal, Grid, List, Map as MapIcon, 
  MapPin, TreePine, DollarSign, Maximize2, Loader2, Sparkles, Heart
} from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
const API_URL = `${API_BASE}/api`;

const PropertiesClient = () => {
  const searchParams = useSearchParams();

  const formatPrice = (price) => {
    if (!price) return '₹0';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  const formatShortPrice = (price) => {
    if (!price) return '₹0';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${(price / 1000).toFixed(0)}k`;
    }
  };
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'split'
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [counties, setCounties] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    property_subtype: searchParams.get('property_subtype') || searchParams.get('subtype') || '',
    state: searchParams.get('state') || '',
    county: searchParams.get('county') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_acres: searchParams.get('min_acres') || '',
    max_acres: searchParams.get('max_acres') || '',
  });

  // Leaflet map reference
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Sync state with URL params & check if saved-only page
  useEffect(() => {
    const isSaved = searchParams.get('saved') === 'true';
    setSavedOnly(isSaved);

    setFilters({
      search: searchParams.get('search') || '',
      property_subtype: searchParams.get('property_subtype') || searchParams.get('subtype') || '',
      state: searchParams.get('state') || '',
      county: searchParams.get('county') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      min_acres: searchParams.get('min_acres') || '',
      max_acres: searchParams.get('max_acres') || '',
    });
  }, [searchParams]);

  // Fetch filter metadata (cities, states, counties)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [citiesRes, statesRes, countiesRes] = await Promise.all([
          axios.get(`${API_URL}/properties/cities`),
          axios.get(`${API_URL}/properties/states`),
          axios.get(`${API_URL}/properties/counties`)
        ]);
        setCities(citiesRes.data || []);
        setStates(statesRes.data || []);
        setCounties(countiesRes.data || []);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch properties based on filters & saved status
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let response;
        if (savedOnly) {
          if (!user) {
            setProperties([]);
            setLoading(false);
            return;
          }
          // Fetch saved properties for this user
          const token = localStorage.getItem('token');
          response = await axios.get(`${API_URL}/users/saved-properties`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          // Fetch all standard properties with filters
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null) {
              params.append(key, value);
            }
          });
          response = await axios.get(`${API_URL}/properties?${params.toString()}`);
        }
        setProperties(response.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchProperties();
    }
  }, [filters, savedOnly, user, authLoading]);

  // Leaflet Map Initialization & Sync
  useEffect(() => {
    if (typeof window === 'undefined' || viewMode !== 'split' || loading) return;

    let mapInstance = mapRef.current;

    const initMap = async () => {
      const L = await import('leaflet');

      if (!mapInstance) {
        // Create Leaflet map
        mapInstance = L.map('leaflet-map', {
          zoomControl: false,
          scrollWheelZoom: true
        }).setView([37.0902, -95.7129], 4); // Centered on USA

        // Set tiles (Premium Mapbox-like Earthy Stamen/OSM theme)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(mapInstance);

        // Add zoom control at bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
        mapRef.current = mapInstance;
      }

      // Clear existing markers
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      } else {
        markersGroupRef.current = L.layerGroup().addTo(mapInstance);
      }

      const validProperties = properties.filter(p => p.latitude && p.longitude);

      if (validProperties.length > 0) {
        const bounds = [];
        validProperties.forEach(p => {
          const lat = parseFloat(p.latitude);
          const lng = parseFloat(p.longitude);
          bounds.push([lat, lng]);

          // Create custom marker icon
          const customIcon = L.divIcon({
            html: `<div class="bg-[#0c3b2e] border-2 border-white text-white font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow-lg whitespace-nowrap">${formatShortPrice(p.price)}</div>`,
            className: 'custom-map-marker',
            iconSize: [60, 30],
            iconAnchor: [30, 15]
          });

          const marker = L.marker([lat, lng], { icon: customIcon });

          // Popup HTML
          const popupHtml = `
            <div class="p-2 w-48 font-sans">
              <img src="${p.images && p.images.length > 0 ? (p.images[0].startsWith('http') ? p.images[0] : API_BASE + p.images[0]) : 'https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=400'}" class="w-full h-24 object-cover rounded-lg mb-2" />
              <h4 class="font-bold text-slate-800 text-sm leading-tight mb-1">${p.title}</h4>
              <p class="text-[#ff914d] font-bold text-xs mb-1">${formatPrice(p.price)} · ${p.acres || 0} Ac</p>
              <p class="text-slate-400 text-xxs mb-2">${p.city}, ${p.state}</p>
              <a href="/properties/${p.id}" class="block w-full text-center bg-[#0c3b2e] text-white py-1.5 rounded text-xs font-bold hover:bg-[#062c22]">View Details</a>
            </div>
          `;

          marker.bindPopup(popupHtml).addTo(markersGroupRef.current);
        });

        // Fit boundaries to include all markers
        mapInstance.fitBounds(bounds, { padding: [40, 40] });
      } else {
        // Default USA View if no properties found
        mapInstance.setView([37.0902, -95.7129], 4);
      }
    };

    initMap();

    // Cleanup on unmount or viewMode changes
    return () => {
      if (viewMode !== 'split' && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [properties, viewMode, loading]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    if (value !== '' && value !== null) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/properties?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      property_subtype: '',
      state: '',
      county: '',
      min_price: '',
      max_price: '',
      min_acres: '',
      max_acres: '',
    });
    router.push(savedOnly ? '/properties?saved=true' : '/properties', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#f8faf6] pt-24 pb-20 font-sans">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and View Mode controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
              {savedOnly ? 'Your Saved Properties' : 'Premium USA Lands for Sale'}
            </h1>
            <p className="text-slate-500 font-bold">
              {loading ? 'Finding listings...' : `${properties.length} parcels found`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode buttons */}
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#0c3b2e] text-white shadow-sm' : 'text-slate-500 hover:text-[#0c3b2e]'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-[#0c3b2e] text-white shadow-sm' : 'text-slate-500 hover:text-[#0c3b2e]'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('split')}
                className={`p-2.5 rounded-full transition-all ${viewMode === 'split' ? 'bg-[#0c3b2e] text-white shadow-sm' : 'text-slate-500 hover:text-[#0c3b2e]'}`}
                title="Split Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            {!savedOnly && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all border shadow-sm ${
                  showFilters ? 'bg-[#0c3b2e] text-white border-transparent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filters Form */}
        {showFilters && !savedOnly && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {/* Search Input */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search Location / Keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ZIP, state, county or title..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
                />
              </div>
            </div>

            {/* Subtype Select */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Land Type</label>
              <select
                value={filters.property_subtype}
                onChange={(e) => handleFilterChange('property_subtype', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
              >
                <option value="">All Types</option>
                <option value="ranches">Ranches</option>
                <option value="farms">Farms</option>
                <option value="hunting">Hunting Land</option>
                <option value="timberland">Timberland</option>
                <option value="waterfront">Waterfront</option>
                <option value="acreage">Acreage</option>
              </select>
            </div>

            {/* State Select */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
              >
                <option value="">All States</option>
                {states.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            {/* County Select */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">County</label>
              <select
                value={filters.county}
                onChange={(e) => handleFilterChange('county', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
              >
                <option value="">All Counties</option>
                {counties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Price Inputs */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price Range (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
                />
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
                />
              </div>
            </div>

            {/* Acres Inputs */}
            <div className="flex flex-col md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Acreage Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min Acres"
                  value={filters.min_acres}
                  onChange={(e) => handleFilterChange('min_acres', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10"
                />
                <input
                  type="number"
                  placeholder="Max Acres"
                  value={filters.max_acres}
                  onChange={(e) => handleFilterChange('max_acres', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10"
                />
              </div>
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full py-2.5 text-sm font-bold text-[#ff914d] hover:bg-orange-50 border border-dashed border-[#ff914d] rounded-xl transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Saved Lands Page - Not logged in prompt */}
        {savedOnly && !user && (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Login to see saved properties</h3>
            <p className="text-slate-500 mb-6">Manage your bookmarked properties in one location by logging in.</p>
            <button onClick={() => router.push('/login')} className="bg-[#0c3b2e] text-white rounded-full px-6 py-2.5 font-bold hover:bg-[#062c22] transition-colors">
              Login to Account
            </button>
          </div>
        )}

        {/* Main Content Layout based on viewMode */}
        {(!savedOnly || user) && (
          <>
            {viewMode === 'split' ? (
              <div className="flex flex-col lg:flex-row gap-6 items-stretch h-[calc(100vh-280px)]">
                {/* Left Side: Property List */}
                <div className="w-full lg:w-1/2 overflow-y-auto pr-2">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-80 bg-slate-200/50 rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <TreePine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No properties match your filters</h3>
                      <button onClick={clearFilters} className="text-[#ff914d] text-sm font-bold underline">Reset search filters</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                    </div>
                  )}
                </div>

                {/* Right Side: Leaflet Map */}
                <div className="w-full lg:w-1/2 rounded-3xl overflow-hidden border border-slate-200 relative shadow-sm h-[400px] lg:h-auto">
                  <div id="leaflet-map" className="w-full h-full z-10"></div>
                </div>
              </div>
            ) : (
              /* Grid / List Views */
              loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 bg-slate-200/50 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <TreePine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No land listings found</h3>
                  <p className="text-slate-500 mb-6">Adjust your search parameters or check back soon.</p>
                  <button onClick={clearFilters} className="bg-[#0c3b2e] text-white rounded-full px-6 py-2.5 font-bold hover:bg-[#062c22]">
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
                  {properties.map((property) => (
                    <div key={property.id} className={viewMode === 'list' ? "md:flex bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm" : ""}>
                      {viewMode === 'list' ? (
                        <div className="flex flex-col md:flex-row w-full">
                          {/* Image box */}
                          <div className="md:w-1/3 h-52 md:h-auto relative">
                            <img 
                              src={property.images && property.images.length > 0 ? (property.images[0].startsWith('http') ? property.images[0] : API_BASE + property.images[0]) : 'https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=600'} 
                              alt={property.title}
                              className="w-full h-full object-cover" 
                            />
                            {property.is_featured && <span className="label-featured absolute top-3 left-3 z-10">★ Featured</span>}
                          </div>
                          {/* Details box */}
                          <div className="md:w-2/3 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs text-[#ff914d] font-bold mb-2">
                                <MapPin className="w-3.5 h-3.5" />
                                {property.city}, {property.county ? `${property.county}, ` : ''}{property.state}
                              </div>
                              <h3 className="text-xl font-extrabold text-slate-800 mb-3 hover:text-[#0c3b2e]">
                                <Link href={`/properties/${property.id}`}>{property.title}</Link>
                              </h3>
                              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{property.description}</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                              <div className="flex gap-4 text-xs font-bold text-slate-600">
                                <span>{property.acres ? `${parseFloat(property.acres).toFixed(1)} Acres` : '— Acres'}</span>
                                <span className="text-slate-300">|</span>
                                <span>Type: {property.property_subtype}</span>
                                {property.water_source && (
                                  <>
                                    <span className="text-slate-300">|</span>
                                    <span>Water: {property.water_source}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-2xl font-black text-[#0c3b2e]">{formatPrice(property.price)}</span>
                                <Link href={`/properties/${property.id}`} className="bg-[#0c3b2e] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#062c22] transition-all">
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <PropertyCard property={property} />
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f8faf6]"><Loader2 className="animate-spin w-10 h-10 text-emerald-600" /></div>}>
      <PropertiesClient />
    </Suspense>
  );
}
