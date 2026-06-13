"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, MapPin, Heart, Mail, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import InterestModal from './InterestModal';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');

const prefixImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=800';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const PropertyCard = ({ property }) => {
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const rawImages = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=800'];
  const images = rawImages.map(prefixImageUrl);

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

  const formatAcres = () => {
    if (property.acres !== undefined && property.acres !== null) {
      return `${parseFloat(property.acres).toLocaleString()} Acres`;
    }
    if (property.area_sqft) {
      return `${(property.area_sqft / 43560).toFixed(1)} Acres`;
    }
    return '— Acres';
  };

  const getLocationString = () => {
    const parts = [];
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.zip_code) parts.push(property.zip_code);
    if (property.county) parts.push(property.county);
    return parts.join(', ');
  };

  // Mock avatar and owner names to look like premium brokers in the screenshot
  const avatarUrl = property.builder_name === "Direct Land Sales" 
    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
    >
      {/* Rectangular Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 flex-shrink-0">
        <Link href={`/properties/${property.id}`} className="block w-full h-full">
          <img
            src={images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        </Link>

        {/* Overlay Icons at the bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
          {property.video_url && (
            <div className="bg-black/60 text-white p-2 rounded-full backdrop-blur-sm shadow-md">
              <Play className="w-4 h-4 fill-current" />
            </div>
          )}
          <div className="bg-black/60 text-white p-2 rounded-full backdrop-blur-sm shadow-md">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow min-w-0">
            {/* Price & Acres */}
            <h3 className="font-extrabold text-slate-800 text-lg leading-tight mb-1">
              {formatPrice(property.price)} <span className="text-slate-400 font-medium mx-1.5">•</span> {formatAcres()}
            </h3>

            {/* Beds / Baths / Sqft line (if available, otherwise fallback) */}
            <p className="text-xs font-semibold text-slate-500 mb-1 leading-normal">
              {property.bedrooms > 0 ? `${property.bedrooms} beds` : 'Vacant Land'} 
              {property.bathrooms > 0 && ` · ${property.bathrooms} baths`}
              {property.area_sqft > 0 && ` · ${property.area_sqft.toLocaleString()} sqft`}
            </p>

            {/* Full Location */}
            <p className="text-xs font-semibold text-slate-500 truncate leading-normal">
              {getLocationString()}
            </p>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5 flex-shrink-0 pt-0.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFavorited(!isFavorited);
              }}
              className={`p-2 rounded-full border border-slate-200 transition-colors ${
                isFavorited ? 'bg-red-50 border-red-200 text-red-500' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-700'
              }`}
              title="Save Listing"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowInterestModal(true);
              }}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"
              title="Contact Owner"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Row matching Agent Layout */}
        <div className="border-t border-slate-100 mt-4 pt-3 flex items-center gap-2.5 flex-shrink-0">
          <img 
            src={avatarUrl} 
            alt="Listing Owner" 
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate leading-none mb-0.5">
              {property.builder_name || 'Direct Owner Sales'}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 truncate leading-none">
              {property.builder_info || 'Direct Land Sales Agent'}
            </p>
          </div>
        </div>
      </div>

      <InterestModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        property={property}
      />
    </motion.div>
  );
};

export default PropertyCard;
