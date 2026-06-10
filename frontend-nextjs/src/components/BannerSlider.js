"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Building2, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';

const banners = [
  {
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600',
    title: 'Luxury Living Reimagined',
    subtitle: 'Exclusive Collection',
    desc: 'Discover architects-designed masterpieces in the heart of Bangalore.',
    tag: 'Premium Estates',
    price: 'Starting \u20b92.5 Cr'
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600',
    title: 'Your Sanctuary of Peace',
    subtitle: 'Modern Minimalist',
    desc: 'Breathtaking views and state-of-the-art amenities awaited for you.',
    tag: 'Dream Homes',
    price: 'Starting \u20b985 Lacs'
  },
  {
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600',
    title: 'Strategic Prime Plots',
    subtitle: 'High Growth Potential',
    desc: 'Invest in the future with our handpicked residential and commercial plots.',
    tag: 'Verified Listings',
    price: 'Market Best Rates'
  }
];

const BannerSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-neutral-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* Background Image with Parallax-like effect */}
          <div className="absolute inset-0">
            <img 
              src={banners[current].image} 
              alt={banners[current].title} 
              className="h-full w-full object-cover"
            />
            {/* Multi-layered Gradients for Depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>

          {/* Content Wrapper */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl text-white">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-3 mb-6"
              >
                <span className="px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-primary-light">
                  {banners[current].tag}
                </span>
                <span className="w-12 h-px bg-white/30 hidden sm:block"></span>
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tighter"
              >
                {banners[current].title}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-lg md:text-xl text-neutral-200 mb-10 leading-relaxed font-medium tracking-tight opacity-90 max-w-xl"
              >
                {banners[current].desc}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-wrap items-center gap-6"
              >
                <Link 
                  href="/properties" 
                  className="group relative overflow-hidden bg-primary text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-2xl hover:scale-105 active:scale-95 text-lg"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <div className="flex items-center space-x-4 px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                   <div className="text-left">
                     <p className="text-white/60 text-xs font-bold uppercase tracking-widest leading-none mb-1">Price Point</p>
                     <p className="text-xl font-extrabold tabular-nums tracking-tighter">{banners[current].price}</p>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modern Controls */}
      <div className="absolute bottom-12 right-12 flex items-center space-x-4">
        <button 
          onClick={prev}
          className="w-14 h-14 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-neutral-900 transition-all active:scale-90"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={next}
          className="w-14 h-14 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-neutral-900 transition-all active:scale-90"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 left-12 flex items-center space-x-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              current === i ? 'w-12 bg-primary' : 'w-3 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Side Decorative Badge - Rotated Text */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[40%] hidden xl:block pointer-events-none">
        <span className="text-[120px] font-black text-white/5 select-none vertical-text tracking-tighter uppercase whitespace-nowrap leading-none">
          LUXURY · ESTATE · PORTFOLIO
        </span>
      </div>
    </div>
  );
};

export default BannerSlider;
