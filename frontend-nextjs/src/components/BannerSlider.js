"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Star, ShieldCheck, Sprout, Droplet } from 'lucide-react';
import Link from 'next/link';

const banners = [
  {
    image: 'https://aronyfarms.com/assets/coffee33-OCJaAMgw.jpg',
    title: 'Managed Coffee Estates',
    subtitle: 'Premium Agroforestry Corridor',
    desc: 'Own and profit from managed coffee cultivation in India\'s most sought-after agroforestry corridor. 100% hassle-free management from planting to harvest.',
    tag: 'Arony Coffee Farm',
    badgeIcon: <Sprout className="w-3.5 h-3.5 text-emerald-400" />,
    price: 'Starting \u20b915 Lacs'
  },
  {
    image: 'https://aronyfarms.com/assets/ProjectViewMain2-VZ-T1qeJ.png',
    title: 'Organic Mango Orchards',
    subtitle: 'Ecologically Resilient Assets',
    desc: 'A rare opportunity to own high-yield managed mango cultivation with certified soil reports, year-round water security, and 100% legal title clearance.',
    tag: 'Arony Mango Farm',
    badgeIcon: <Droplet className="w-3.5 h-3.5 text-emerald-400" />,
    price: 'Starting \u20b912 Lacs'
  },
  {
    image: 'https://aronyfarms.com/assets/ProjectPageMain1-DpgTh2Pj.png',
    title: 'Sandalwood & Timberlands',
    subtitle: 'High Growth Capital Asset',
    desc: 'Invest in sustainable managed timber plantations combined with organic crop yields. Expert agronomy management ensures robust, long-term capital appreciation.',
    tag: 'Agroforestry plots',
    badgeIcon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
    price: 'Market Best Rates'
  }
];

const BannerSlider = ({ children }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex flex-col justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image with Parallax Effect */}
          <div className="absolute inset-0">
            <img 
              src={banners[current].image} 
              alt={banners[current].title} 
              className="h-full w-full object-cover object-center"
            />
            {/* Multi-layered Premium Gradients for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-transparent"></div>
          </div>

          {/* Content Container */}
          <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center pt-24 pb-28 md:pb-32">
            <div className="max-w-3xl text-left">
              {/* Badge Overlay */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex items-center space-x-2.5 mb-6 px-4 py-2 bg-emerald-950/40 backdrop-blur-md border border-emerald-500/20 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-emerald-300 shadow-lg"
              >
                {banners[current].badgeIcon}
                <span>{banners[current].tag}</span>
              </motion.div>

              {/* Slide Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight"
                style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
              >
                {banners[current].title}
              </motion.h1>

              {/* Subheading */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl font-semibold text-emerald-400 mb-6 font-heading"
              >
                {banners[current].subtitle}
              </motion.h2>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-base sm:text-lg text-slate-200 mb-8 leading-relaxed max-w-2xl font-normal opacity-95"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
              >
                {banners[current].desc}
              </motion.p>

              {/* CTA and Price Point */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-wrap items-center gap-5 mb-8"
              >
                <Link 
                  href="/properties" 
                  className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  <span>Explore Properties</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <div className="flex items-center space-x-4 px-5 py-3.5 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700/30">
                  <div className="text-left">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Investment</p>
                    <p className="text-white text-base font-extrabold tabular-nums tracking-tight">{banners[current].price}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Children Overlay (For Search Bar or custom overlays) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-auto pb-12 sm:pb-16 lg:pb-20">
        {children}
      </div>

      {/* Slider Controls (Next/Prev Arrows) */}
      <div className="absolute bottom-10 right-6 sm:right-10 lg:right-16 z-30 flex items-center space-x-3">
        <button 
          onClick={prev}
          aria-label="Previous slide"
          className="w-12 h-12 rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={next}
          aria-label="Next slide"
          className="w-12 h-12 rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-10 left-6 sm:left-10 lg:left-16 z-30 flex items-center space-x-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === i ? 'w-10 bg-emerald-500' : 'w-2 bg-slate-500/50 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
