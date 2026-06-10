"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Maximize, Droplet, Sprout, Heart, Eye, ArrowRight, RefreshCw, Video } from 'lucide-react';
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
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000)   return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const formatAcres = (sqft) => {
    if (!sqft) return '— Acres';
    return `${(sqft / 43560).toFixed(1)} Ac`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="item-wrap-v6 flex flex-col h-full group">
        {/* ── Image ── */}
        <div className="item-header relative overflow-hidden" style={{ height: 240 }}>
          <Link href={`/properties/${property.id}`} className="block h-full">
            <img
              src={images[0]}
              alt={property.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
              className="group-hover:scale-105"
            />
          </Link>

          {/* Price badge — floated over image */}
          <div style={{
            position: 'absolute', bottom: 14, left: 14, zIndex: 10,
            background: 'linear-gradient(135deg, var(--green), var(--green-dark))',
            color: '#fff', fontWeight: 800, fontSize: 16,
            padding: '5px 14px', borderRadius: 999,
            boxShadow: 'var(--shadow-green)',
          }}>
            {formatPrice(property.price)}
          </div>

          {/* Featured Badge */}
          {property.is_featured && (
            <span className="label-featured">★ Featured</span>
          )}

          {property.video_url && (
            <div style={{
              position: 'absolute', top: 14, right: 14, zIndex: 10,
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              padding: '6px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Video className="w-4 h-4" />
            </div>
          )}

          {/* Status Badges */}
          <div className="label-status-wrap">
            <span className="label-status">For Sale</span>
            <span className="label-status status-new">New</span>
          </div>

          {/* Hover Tools */}
          <div className="item-tools">
            <Link href={`/properties/${property.id}`} className="item-tool-btn" title="View Details">
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={e => { e.preventDefault(); setIsFavorited(!isFavorited); }}
              className="item-tool-btn"
              title="Favourite"
              style={isFavorited ? { background: 'var(--green)', color: '#fff' } : {}}
            >
              <Heart className="w-4 h-4" style={isFavorited ? { fill: '#fff' } : {}} />
            </button>
            <button
              onClick={e => { e.preventDefault(); alert('Added to compare list!'); }}
              className="item-tool-btn"
              title="Compare"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="item-body flex-grow flex flex-col justify-between">
          <div>
            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
              <MapPin style={{ width: 13, height: 13, color: 'var(--green)', flexShrink: 0 }} />
              {property.area}, {property.city}
            </div>

            {/* Title */}
            <h3 style={{ marginBottom: 12 }}>
              <Link href={`/properties/${property.id}`} className="item-title-link" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {property.title}
              </Link>
            </h3>
          </div>

          <div>
            {/* Meta row */}
            <div className="item-meta-row" style={{ marginBottom: 16 }}>
              <div className="item-meta-item" style={{ flex: 1, justifyContent: 'center' }}>
                <Maximize style={{ width: 14, height: 14, marginRight: 5, color: 'var(--text-faint)' }} />
                <span>{formatAcres(property.area_sqft)}</span>
              </div>
              <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch', margin: '2px 0' }} />
              <div className="item-meta-item" style={{ flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
                <Droplet style={{ width: 14, height: 14, marginRight: 5, color: '#60a5fa', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {property.water_source ? property.water_source.split('&')[0].split(' ')[0] : 'N/A'}
                </span>
              </div>
              <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch', margin: '2px 0' }} />
              <div className="item-meta-item" style={{ flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
                <Sprout style={{ width: 14, height: 14, marginRight: 5, color: 'var(--green)', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {property.soil_type ? property.soil_type.split(' ')[0] : 'N/A'}
                </span>
              </div>
            </div>

            {/* CTA row */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={e => { e.preventDefault(); setShowInterestModal(true); }}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontSize: 12, fontWeight: 800, color: 'var(--green)',
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 5,
                  cursor: 'pointer', transition: 'color 0.2s',
                }}
              >
                Enquire Now <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {new Date(property.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
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
    </motion.div>
  );
};

export default PropertyCard;
