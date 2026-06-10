"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, Maximize, Sprout, Droplet, ShieldCheck, Zap,
  Phone, ArrowLeft, Check, Compass, Layers, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import InterestModal from '@/components/InterestModal';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');

const prefixImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=1200';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const PropertyDetailClient = ({ property }) => {
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const rawImages = property.images?.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=1200'];
  
  const images = rawImages.map(prefixImageUrl);

  const videoUrl = property.video_url 
    ? (property.video_url.startsWith('http') ? property.video_url : `${API_BASE}${property.video_url}`) 
    : null;

  // Diagnostic log to trace data flow
  useEffect(() => {
    console.log('Property Data:', property);
    console.log('Processed Amenities:', property.amenities);
  }, [property]);

  let amenities = [];
  if (Array.isArray(property.amenities) && property.amenities.length > 0) {
    amenities = property.amenities;
  } else if (typeof property.amenities === 'string' && property.amenities.length > 0) {
    amenities = property.amenities.split(',').map(item => item.trim());
  }

  const formatAcres = (sqft) => {
    if (!sqft) return 'N/A';
    const acres = sqft / 43560;
    return `${acres.toFixed(1)} Acres`;
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-12 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs / Back */}
        <Link href="/properties" className="inline-flex items-center space-x-2 text-slate-500 hover:text-[#0A9BA2] transition-colors mb-8 font-bold cursor-pointer uppercase text-xs tracking-wider">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to lands</span>
        </Link>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 leading-tight">{property.title}</h1>
            <div className="flex items-center text-slate-500 mb-6 font-semibold text-sm">
              <MapPin className="w-4 h-4 mr-1 text-[#1976D2]" />
              <span>{property.area}, {property.city}</span>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm mb-8 border border-slate-100">
              <div className="aspect-[16/9] relative">
                <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar bg-slate-50 border-t border-slate-100">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${activeImage === idx ? 'border-[#0A9BA2] scale-95 shadow-md' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Land Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <Maximize className="w-6 h-6 text-[#0A9BA2] mb-3" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Land Area</span>
                <p className="font-bold text-slate-800 text-sm">{formatAcres(property.area_sqft)}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <Droplet className="w-6 h-6 text-[#1976D2] mb-3" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Water Source</span>
                <p className="font-bold text-slate-800 text-sm truncate w-full">{property.water_source || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <Sprout className="w-6 h-6 text-[#0A9BA2] mb-3" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Soil Type</span>
                <p className="font-bold text-slate-800 text-sm truncate w-full">{property.soil_type || 'N/A'}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <Compass className="w-6 h-6 text-[#1976D2] mb-3" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Road Width</span>
                <p className="font-bold text-slate-800 text-sm">{property.road_width_ft ? `${property.road_width_ft} Ft` : 'N/A'}</p>
              </div>
            </div>

            {/* Video Walkthrough (HTML5 Video Player) */}
            {videoUrl && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Video Walkthrough</h2>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-slate-100">
                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Land Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                {property.description}
              </p>
            </div>

            {/* Detailed Farming Specifications */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Farming Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Crop History / Suitable Crops</span>
                  <span className="font-semibold text-slate-800">{property.crop_history || 'Organic farming setup ready'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Boundary Fencing</span>
                  <span className="font-semibold text-slate-800">{property.fencing || 'Unfenced/Natural boundary'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Survey / Plot Location</span>
                  <span className="font-semibold text-slate-800">{property.address || 'Survey verification available upon callback'}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Land Classification</span>
                  <span className="font-semibold text-slate-800">{capitalize(property.property_subtype)} - {capitalize(property.property_type)}</span>
                </div>
              </div>
            </div>

            {/* Amenities / Infrastructure */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Amenities & Infrastructure</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {amenities.map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-slate-700">
                      <Check className="w-4 h-4 text-[#0A9BA2] flex-shrink-0" />
                      <span className="text-sm font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              {/* Pricing & CTA Card */}
              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Pricing</span>
                  <div className="text-4xl font-black text-[#0A9BA2]">
                    {formatPrice(property.price)}
                  </div>
                </div>

                <button
                  onClick={() => setShowInterestModal(true)}
                  className="w-full bg-[#0A9BA2] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#0A9BA2]/10 hover:bg-[#087d83] transition-colors mb-4 cursor-pointer"
                >
                  Request Call & Soil Report
                </button>
                <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#0A9BA2]" />
                  <span>Title deeds & survey verified</span>
                </div>
              </div>

              {/* Contact Card (Clean dark blue style matching footers) */}
              <div className="bg-[#0c162c] rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-6 tracking-tight">Need Expert Agronomy Advice?</h3>
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="Consultant" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Nature Lands Consultant</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#0A9BA2]">Land Planning & Crops</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a
                      href="tel:+919876543210"
                      className="w-full py-3.5 bg-white text-[#0c162c] rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center space-x-3 shadow-md"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Direct Call</span>
                    </a>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:opacity-95 transition-opacity flex items-center justify-center space-x-3 shadow-md"
                    >
                      <Zap className="w-4 h-4" />
                      <span>WhatsApp Inquiry</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InterestModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        property={property}
      />
    </div>
  );
};

export default PropertyDetailClient;
