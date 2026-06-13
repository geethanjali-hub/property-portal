"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
const API_URL  = `${API_BASE}/api`;

const HomePage = () => {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const lr = await fetch(`${API_URL}/properties?limit=4`);
        setProperties(await lr.json());
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push('/properties');
    }
  };

  /* ── DATA ── */
  const categorySlider = [
    { name: 'Barndominiums for Sale', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700' },
    { name: 'Farms for Sale', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700' },
    { name: 'Cheap Land for Sale', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700' }
  ];

  const newsList = [
    { 
      date: 'June 2, 2026', 
      title: '10 Biggest Ranches for Sale in America', 
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500',
      excerpt: "As we head into the new year, here's a snapshot of the biggest ranches for sale throughout the United States. At a..." 
    },
    { 
      date: 'June 1, 2026', 
      title: 'The Best Outdoor Dog Breeds for Life on the Land', 
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500',
      excerpt: 'To celebrate all that is wonderful about our canine partners in adventure, here are eight of our favorite dog breeds...' 
    },
    { 
      date: 'May 31, 2026', 
      title: 'How To Maximize Value When Selling Land in Alabama', 
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500',
      excerpt: 'With over 50,000 square miles of land area and a population surpassing 5 million people, Alabama is home to an...' 
    },
    { 
      date: 'May 29, 2026', 
      title: 'How To Best Approach Selling Land in Iowa', 
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500',
      excerpt: "Land is a unique commodity, and selling acreage requires a level of planning and preparation from landowners. If you're..." 
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">

      {/* ══════════════════ 1. HERO BANNER SECTION ══════════════════ */}
      <section className="relative h-[620px] md:h-[680px] bg-black flex items-center justify-center overflow-hidden">
        {/* Lake Sunset Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920')` }}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg !text-white" style={{ color: '#fff' }}>
              Find Your Open Space
            </h1>
            <p className="text-lg md:text-xl font-medium text-slate-100 drop-shadow-md">
              Find farms, ranches, acreage, country homes, and land for sale
            </p>
          </motion.div>

          {/* White Pill-shaped Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-2xl bg-white rounded-full p-2 shadow-2xl flex items-center border border-white/20"
          >
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center justify-between">
              <input 
                type="text"
                placeholder="Enter a State, County, City, or ID"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 font-semibold focus:outline-none pl-6 text-base"
              />
              <button 
                type="submit" 
                className="bg-[#0c3b2e] hover:bg-[#062c22] text-white p-3.5 rounded-full transition-colors flex items-center justify-center shadow-lg"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ 2. LAND FOR SALE IN THE UNITED STATES ══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800">
              Land for Sale in the United States
            </h2>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin w-10 h-10 text-emerald-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ 3. POPULAR LAND FOR SALE NEAR ME ══════════════════ */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="max-w-xl mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Popular Land for Sale Near Me
            </h2>
            <p className="text-slate-500 font-semibold text-sm leading-relaxed">
              Find land for sale including undeveloped land, residential and commercial lots, and more.
            </p>
          </div>

          <Link 
            href="/properties" 
            className="mb-12 bg-[#0c3b2e] hover:bg-[#062c22] text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-md transition-all uppercase tracking-wider"
          >
            Land for Sale Near Me
          </Link>

          {/* Cards Carousel Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative">
            {categorySlider.map((item, idx) => (
              <div 
                key={idx} 
                className="relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-sm cursor-pointer border border-slate-200"
              >
                {/* Background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-103 transition-transform duration-500" 
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                
                {/* Bottom title */}
                <div className="absolute bottom-6 left-6 text-left">
                  <h3 className="!text-white font-serif text-xl font-bold tracking-wide" style={{ color: '#fff' }}>
                    {item.name}
                  </h3>
                </div>
              </div>
            ))}

            {/* Pagination dots */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#0c3b2e]' : 'bg-slate-300'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. NEWS FROM LAND.COM ══════════════════ */}
      <section className="py-20 bg-[#0b221a] text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight !text-white" style={{ color: '#fff' }}>
              News from Land.com
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
            {newsList.map((news, idx) => (
              <div 
                key={idx} 
                className="bg-[#112d23] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full hover:border-white/10 transition-colors"
              >
                <div className="aspect-[16/10] bg-slate-800 overflow-hidden relative">
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-2">{news.date}</span>
                    <h3 className="font-sans text-base font-bold !text-white mb-2 leading-snug" style={{ color: '#fff' }}>
                      {news.title}
                    </h3>
                    <p className="text-xs text-slate-300/80 font-medium leading-relaxed mb-4">
                      {news.excerpt}
                    </p>
                  </div>
                  <Link href="/blogs" className="text-xs font-bold hover:underline inline-flex items-center text-white/90">
                    Full Article &gt;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Link 
            href="/blogs" 
            className="border border-white hover:bg-white hover:text-[#0b221a] text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all uppercase"
          >
            View all articles
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
