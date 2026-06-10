"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import PropertyCard from '@/components/PropertyCard';
import { Search, SlidersHorizontal, Sprout } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');

const PropertiesClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [cities, setCities] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    property_subtype: searchParams.get('property_subtype') || searchParams.get('subtype') || '',
    city: searchParams.get('city') || ''
  });

  // Sync state with URL params
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      property_subtype: searchParams.get('property_subtype') || searchParams.get('subtype') || '',
      city: searchParams.get('city') || ''
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/properties/cities`);
        setCities(response.data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });

        const response = await axios.get(`${API_URL}/api/properties?${params.toString()}`);
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/properties?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({ search: '', property_subtype: '', city: '' });
    router.push('/properties', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-12 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Farming Lands in South India</h1>
            <p className="text-slate-500 font-bold">{properties.length} agricultural plots found</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search region, soil..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A9BA2]/20 w-full sm:w-64 focus:border-[#0A9BA2]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                showFilters ? 'bg-[#0A9BA2] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Land Category</label>
              <select
                value={filters.property_subtype}
                onChange={(e) => handleFilterChange('property_subtype', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0A9BA2]/20 focus:bg-white"
              >
                <option value="">All Categories</option>
                <option value="orchard">Orchard</option>
                <option value="plantation">Plantation</option>
                <option value="agricultural">Agricultural Plot</option>
                <option value="dry_land">Dry Land</option>
                <option value="wet_land">Wet Land</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location / Region</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0A9BA2]/20 focus:bg-white"
              >
                <option value="">All Locations</option>
                {Array.isArray(cities) && cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full py-3 text-sm font-bold text-[#f07a22] hover:bg-orange-50 rounded-2xl transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Sprout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No farming lands found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search query</p>
            <button onClick={clearFilters} className="btn-primary rounded-full px-6 py-2.5">
              View all farming lands
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(properties) && properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><div className="spinner"></div></div>}>
      <PropertiesClient />
    </Suspense>
  );
}
