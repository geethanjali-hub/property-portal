"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin, Maximize, Sprout, Droplet, ShieldCheck, Zap,
  Phone, ArrowLeft, Check, Compass, Layers, CheckCircle2,
  Mail, Send, FileText, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import InterestModal from '@/components/InterestModal';
import axios from 'axios';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
const API_URL = `${API_BASE}/api`;

const prefixImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=1200';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const PropertyDetailClient = ({ property }) => {
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: `Hi, I am interested in "${property.title}". Please provide more details.` });
  const [submitting, setSubmitting] = useState(false);

  const mapRef = useRef(null);

  // Format Price in INR
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

  const rawImages = property.images?.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=1200'];
  
  const images = rawImages.map(prefixImageUrl);

  const videoUrl = property.video_url 
    ? (property.video_url.startsWith('http') ? property.video_url : `${API_BASE}${property.video_url}`) 
    : null;

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !property.latitude || !property.longitude) return;

    let mapInstance = mapRef.current;

    const initMap = async () => {
      const L = await import('leaflet');
      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);

      if (!mapInstance) {
        mapInstance = L.map('detail-map', {
          zoomControl: false,
          scrollWheelZoom: false
        }).setView([lat, lng], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
        mapRef.current = mapInstance;
      }

      // Add Marker
      const markerIcon = L.divIcon({
        html: `<div class="bg-[#0c3b2e] border-2 border-white text-white font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow-lg whitespace-nowrap">${formatPrice(property.price)}</div>`,
        className: 'custom-map-marker',
        iconSize: [80, 30],
        iconAnchor: [40, 15]
      });

      L.marker([lat, lng], { icon: markerIcon }).addTo(mapInstance);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [property]);

  let amenities = [];
  if (Array.isArray(property.amenities) && property.amenities.length > 0) {
    amenities = property.amenities;
  } else if (typeof property.amenities === 'string' && property.amenities.length > 0) {
    amenities = property.amenities.split(',').map(item => item.trim());
  }

  const formatAcres = () => {
    if (property.acres !== undefined && property.acres !== null) {
      return `${parseFloat(property.acres).toFixed(1)} Acres`;
    }
    if (property.area_sqft) {
      return `${(property.area_sqft / 43560).toFixed(1)} Acres`;
    }
    return 'N/A';
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/properties/interest`, {
        property_id: property.id,
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone
      });
      toast.success('Your message has been sent directly to the owner!');
      setLeadForm({ name: '', email: '', phone: '', message: `Hi, I am interested in "${property.title}". Please provide more details.` });
    } catch (err) {
      console.error(err);
      toast.error('Submission failed. You may have already submitted an inquiry for this property.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf6] pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/properties" className="inline-flex items-center space-x-2 text-slate-500 hover:text-[#0c3b2e] transition-colors mb-6 font-bold cursor-pointer uppercase text-xs tracking-wider">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Land Listings</span>
        </Link>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 leading-tight">{property.title}</h1>
            <div className="flex items-center text-slate-500 mb-6 font-semibold text-sm">
              <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
              <span>{property.city}, {property.county ? `${property.county}, ` : ''}{property.state} {property.zip_code}</span>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm mb-8 border border-slate-100">
              <div className="aspect-[16/9] relative">
                <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover animate-fade-in" />
              </div>
              {images.length > 1 && (
                <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar bg-slate-50 border-t border-slate-100">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${activeImage === idx ? 'border-[#0c3b2e] scale-95 shadow-md' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <Maximize className="w-6 h-6 text-[#0c3b2e] mb-3" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Acres</span>
                <p className="font-extrabold text-slate-800 text-sm">{formatAcres()}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <Droplet className="w-6 h-6 text-blue-500 mb-3" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Water Source</span>
                <p className="font-extrabold text-slate-800 text-sm truncate w-full">{property.water_source || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <Sprout className="w-6 h-6 text-emerald-600 mb-3" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Soil Type</span>
                <p className="font-extrabold text-slate-800 text-sm truncate w-full">{property.soil_type || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <Compass className="w-6 h-6 text-orange-500 mb-3" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Road Width</span>
                <p className="font-extrabold text-slate-800 text-sm">{property.road_width_ft ? `${property.road_width_ft} Ft` : 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-10">
              <h2 className="text-2xl font-bold text-slate-850 mb-6">Land Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                {property.description}
              </p>
            </div>

            {/* Video Walkthrough */}
            {videoUrl && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-10">
                <h2 className="text-2xl font-bold text-slate-850 mb-6">Video Walkthrough</h2>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-slate-100">
                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-10">
              <h2 className="text-2xl font-bold text-slate-850 mb-6">Property Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Property Type</span>
                  <span className="font-semibold text-slate-800">{capitalize(property.property_subtype)}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">County / Region</span>
                  <span className="font-semibold text-slate-800">{property.county || 'N/A'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">State & ZIP</span>
                  <span className="font-semibold text-slate-800">{property.state} {property.zip_code}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Zoning / Land Classification</span>
                  <span className="font-semibold text-slate-800">{property.crop_history || 'Agricultural/Recreational'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Boundary Fencing</span>
                  <span className="font-semibold text-slate-800">{property.fencing || 'Unfenced/Natural'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Exact Coordinates</span>
                  <span className="font-semibold text-slate-800">
                    {property.latitude && property.longitude ? `${property.latitude}, ${property.longitude}` : 'Available upon callback'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Location Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-10">
                <h2 className="text-2xl font-bold text-slate-850 mb-6">Interactive Map Location</h2>
                <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-200">
                  <div id="detail-map" className="w-full h-full z-10"></div>
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-850 mb-6">Infrastructure & Utilities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {amenities.map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-slate-700">
                      <Check className="w-4 h-4 text-[#0c3b2e] flex-shrink-0" />
                      <span className="text-sm font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              
              {/* Pricing card & direct inquiry */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Owner Direct Pricing</span>
                <div className="text-4xl font-black text-[#0c3b2e] mb-6">
                  {formatPrice(property.price)}
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      value={leadForm.name}
                      onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="johndoe@example.com"
                      value={leadForm.email}
                      onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+1 (555) 000-0000"
                      value={leadForm.phone}
                      onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                    <textarea 
                      rows="3"
                      value={leadForm.message}
                      onChange={e => setLeadForm({ ...leadForm, message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c3b2e]/10 focus:border-[#0c3b2e]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0c3b2e] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#0c3b2e]/10 hover:bg-[#062c22] transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Owner</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-bold mt-4 pt-4 border-t border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-[#0c3b2e]" />
                  <span>Direct owner deal · No brokerage fees</span>
                </div>
              </div>

              {/* Direct call options */}
              <div className="bg-[#0c3b2e] border border-transparent rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-4 tracking-tight">Need Direct Info?</h3>
                  <p className="text-slate-200 text-xs mb-6">Call the direct land owner/operator for quick terrain details and surveys.</p>
                  <a
                    href="tel:+18005550100"
                    className="w-full py-3 bg-white text-[#0c3b2e] rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center space-x-3 shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call +1 (800) 555-0100</span>
                  </a>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailClient;
