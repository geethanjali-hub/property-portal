"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Sprout, ArrowRight, Droplet, Star, Loader2,
  Calendar, Quote, Maximize, Building2, TreePine, Wheat, Wind,
  Phone, Mail, Shield, CheckCircle, Award, TrendingUp
} from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
const API_URL  = `${API_BASE}/api`;

const HomePage = () => {
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties]  = useState([]);
  const [latestProperties,   setLatestProperties]    = useState([]);
  const [activeTab,          setActiveTab]            = useState('all');
  const [loading,            setLoading]              = useState(true);
  const [cities,             setCities]               = useState([]);
  const [activeSearchTab,    setActiveSearchTab]      = useState('buy');

  const [searchState, setSearchState] = useState({
    subtype: '', search: '', city: '', water: ''
  });

  const [currentMedia, setCurrentMedia] = useState(0);
  const heroMedia = [
    "https://videos.pexels.com/video-files/2816223/2816223-uhd_3840_2160_24fps.mp4",
    "https://videos.pexels.com/video-files/3205307/3205307-uhd_2560_1440_25fps.mp4",
    "https://videos.pexels.com/video-files/1448735/1448735-uhd_3840_2160_24fps.mp4"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMedia((prev) => (prev + 1) % heroMedia.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/properties/cities`);
        const d = await r.json();
        if (Array.isArray(d)) setCities(d);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [fr, lr] = await Promise.all([
          fetch(`${API_URL}/properties/featured?limit=6`),
          fetch(`${API_URL}/properties?limit=8`),
        ]);
        setFeaturedProperties(await fr.json());
        setLatestProperties(await lr.json());
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (searchState.subtype) p.append('property_subtype', searchState.subtype);
    if (searchState.search)  p.append('search', searchState.search);
    if (searchState.city)    p.append('city', searchState.city);
    if (searchState.water)   p.append('water_source', searchState.water);
    router.push(`/properties?${p.toString()}`);
  };

  const getFiltered = () =>
    activeTab === 'all' ? latestProperties
    : latestProperties.filter(p => (p.property_subtype || '').toLowerCase() === activeTab);

  /* ── DATA ── */
  const categoryGrid = [
    { name: 'Organic Orchards',      subtype: 'orchard',       count: '12 Listings', icon: <TreePine className="w-6 h-6" />,   image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900', span: 'grid-item-span-2' },
    { name: 'Spice Plantations',     subtype: 'plantation',    count: '8 Listings',  icon: <Sprout className="w-6 h-6" />,     image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=900', span: 'grid-item-col-2' },
    { name: 'Paddy & Agro Fields',   subtype: 'agricultural',  count: '15 Listings', icon: <Wheat className="w-6 h-6" />,      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900', span: '' },
    { name: 'Dry Fenced Lands',      subtype: 'dry_land',      count: '6 Listings',  icon: <Wind className="w-6 h-6" />,       image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900', span: '' },
    { name: 'Canal Irrigated Lands', subtype: 'wet_land',      count: '8 Listings',  icon: <Droplet className="w-6 h-6" />,    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900', span: 'grid-item-col-2' },
    { name: 'Commercial Agro Plots', subtype: 'commercial',    count: '4 Listings',  icon: <Building2 className="w-6 h-6" />,  image: 'https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=900', span: 'grid-item-col-2' },
    { name: 'Riverfront Farms',      subtype: 'waterfront',    count: '7 Listings',  icon: <Droplet className="w-6 h-6" />,    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900', span: '' },
    { name: 'Timber & Forestry',     subtype: 'timberland',    count: '9 Listings',  icon: <TreePine className="w-6 h-6" />,   image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900', span: 'grid-item-span-2' },
  ];

  const testimonials = [
    { name: 'Arjun Mehta', role: 'Agro Investor, Mumbai', rating: 5, image: 'https://demo27.houzez.co/wp-content/uploads/2016/02/agent-2-150x150.png', text: 'Nature Lands made finding legal, verified agricultural lands extremely straightforward. Their soil reports and title verification gave me complete confidence before investing.' },
    { name: 'Priya Nair',  role: 'Organic Farmer, Kerala',  rating: 5, image: 'https://demo27.houzez.co/wp-content/uploads/2016/02/agent-1-150x150.jpg', text: 'The soil chemistry analysis and water availability metrics on each property page are invaluable. I bought a 15-acre mango orchard and it is thriving beyond my expectations.' },
    { name: 'Kathleen S.', role: 'Green Earth Trust, Delhi',   rating: 5, image: 'https://demo27.houzez.co/wp-content/uploads/2016/02/agent-5-150x150.jpg', text: 'Superb platform! Searching for plots with borewell water sources is very convenient. The transactions were smooth, legal, and entirely professional. Highly recommend.' },
  ];

  const blogs = [
    { title: 'Top 10 Tips for Soil Preparation on Black Cotton Lands', category: 'Agronomy',   date: 'June 1, 2026',   readTime: '5 min', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700', excerpt: 'Exact organic practices, soil amendments and moisture conservation methods to prepare black cotton soils for high-yield farming.' },
    { title: 'Understanding Land Title Deeds & Legal Due Diligence',   category: 'Legal Guide', date: 'May 24, 2026',   readTime: '7 min', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700', excerpt: 'Scouting farmland is only step one. Learn about deeds, survey numbers, partition deeds and encumbrance reports in India.' },
    { title: 'Water Security: Borewells vs Canal-fed Farm Plots',      category: 'Irrigation',  date: 'May 15, 2026',   readTime: '6 min', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700', excerpt: 'A comprehensive comparison of agricultural water systems. Audit local aquifers and ensure year-round reliable irrigation.' },
    { title: 'Why Agroforestry (Sandalwood & Teak) is a Smart Asset',  category: 'Investment',  date: 'April 28, 2026', readTime: '8 min', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700', excerpt: 'Combine agricultural income with long-term timber value. We explain the economics, regulations, and layout planning.' },
  ];

  const whyUs = [
    { icon: <Shield className="w-6 h-6" />,       title: 'Legal Verified',     desc: '100% title-cleared listings with encumbrance certificates.' },
    { icon: <CheckCircle className="w-6 h-6" />,  title: 'Soil Certified',     desc: 'Every plot comes with a professional soil chemistry analysis report.' },
    { icon: <Award className="w-6 h-6" />,        title: 'Water Audited',      desc: 'Borewell yield tests and canal flow data verified independently.' },
    { icon: <TrendingUp className="w-6 h-6" />,   title: 'High ROI Assets',    desc: 'Organic land values appreciate 12–18% annually in prime zones.' },
  ];

  /* ── RENDER ── */
  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-body)', background: 'var(--off-white)' }}>

      {/* ══════════════════ 1. HERO ══════════════════ */}
      <section className="hz-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', backgroundColor: '#0a1628' }}>
        <AnimatePresence mode="wait">
          <motion.video
            key={currentMedia}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: 2, ease: "easeInOut" },
              scale: { duration: 12, ease: "linear" }
            }}
            autoPlay
            muted
            loop
            playsInline
            className="hz-hero__bg"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.1) contrast(1.1)' }}
          >
            <source src={heroMedia[currentMedia]} type="video/mp4" />
          </motion.video>
        </AnimatePresence>
        <div className="hz-hero__overlay" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%)', position: 'absolute', inset: 0 }} />
        <div className="hz-hero__overlay2" />

        <div className="hz-hero__content" style={{ zIndex: 10, width: '100%', maxWidth: 900, margin: '0 auto', paddingTop: 100 }}>
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="hz-hero__badge"
          >
            <Sprout style={{ width: 13, height: 13 }} />
            India's #1 Premium Organic Land Marketplace
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="hz-hero__title" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            Find Your Perfect<br /><span>Farming Land</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="hz-hero__subtitle"
          >
            Buy & sell verified organic farming lands, orchards and plantations with 100% legal confidence. Soil certified. Water audited. Expert guided.
          </motion.p>

          {/* Search tabs */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.8 }}
            className="hz-search-tabs"
          >
            {['buy','rent','commercial'].map(t => (
              <button key={t} className={`hz-search-tab ${activeSearchTab === t ? 'active' : ''}`}
                onClick={() => setActiveSearchTab(t)}>
                {t === 'buy' ? 'For Sale' : t === 'rent' ? 'For Lease' : 'Commercial'}
              </button>
            ))}
          </motion.div>

          {/* Search bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0 }}
            className="hz-hero__search-wrap"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(20px)', 
              WebkitBackdropFilter: 'blur(20px)',
              padding: '12px', 
              borderRadius: '24px', 
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <form onSubmit={handleSearch}>
              <div className="hz-hero__search-bar">
                <div className="hz-search-field">
                  <Sprout className="hz-search-field__icon" style={{ color: '#3ee0aa' }} />
                  <select value={searchState.subtype}
                    onChange={e => setSearchState({ ...searchState, subtype: e.target.value })}
                    aria-label="Land Type">
                    <option value="">All Land Types</option>
                    <option value="orchard">Orchard</option>
                    <option value="plantation">Plantation</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="dry_land">Dry Land</option>
                    <option value="wet_land">Wet Land</option>
                  </select>
                </div>

                <div className="hz-search-field" style={{ flex: '2 1 0' }}>
                  <Search className="hz-search-field__icon" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <input type="text" placeholder="Location, keyword, survey number…"
                    value={searchState.search}
                    onChange={e => setSearchState({ ...searchState, search: e.target.value })} />
                </div>

                <div className="hz-search-field">
                  <MapPin className="hz-search-field__icon" style={{ color: '#38bdf8' }} />
                  <select value={searchState.city}
                    onChange={e => setSearchState({ ...searchState, city: e.target.value })}
                    aria-label="City">
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="hz-search-field">
                  <Droplet className="hz-search-field__icon" style={{ color: '#60a5fa' }} />
                  <select value={searchState.water}
                    onChange={e => setSearchState({ ...searchState, water: e.target.value })}
                    aria-label="Water Source">
                    <option value="">Water Source</option>
                    <option value="Borewell">Borewell</option>
                    <option value="Canal">Canal</option>
                    <option value="River">River</option>
                    <option value="Open Well">Open Well</option>
                  </select>
                </div>

                <button type="submit" className="hz-search-submit">
                  <Search style={{ width: 16, height: 16 }} /> Search
                </button>
              </div>
            </form>
          </motion.div>

          {/* Quick links */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.2 }}
            className="hz-hero__quick-links"
          >
            <Link href="/properties" className="hz-hero__quick-btn hz-hero__quick-btn--primary">
              <Maximize style={{ width: 14, height: 14 }} /> Browse All Lands
            </Link>
            <Link href="/admin" className="hz-hero__quick-btn hz-hero__quick-btn--ghost">
              List Your Land Free
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.4 }}
            className="hz-hero__stats"
          >
            {[
              { value: '500+', label: 'Verified Lands' },
              { value: '12+',  label: 'Districts' },
              { value: '98%',  label: 'Legal Clearance' },
              { value: '4.9★', label: 'Buyer Rating' },
            ].map(s => (
              <div key={s.label} className="hz-hero__stat">
                <div className="hz-hero__stat-value">{s.value}</div>
                <div className="hz-hero__stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="hz-hero__scroll">
          <div className="hz-hero__scroll-line" />
          <div className="hz-hero__scroll-dot" />
        </div>
      </section>

      {/* ══════════════════ 2. CATEGORY GRID ══════════════════ */}
      <section style={{ padding: '96px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 32px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ textAlign: 'center', marginBottom: 56, maxWidth: 640, margin: '0 auto 56px' }}
          >
            <div className="section-chip"><Sprout style={{ width: 12, height: 12 }} /> Explore Categories</div>
            <h2 className="section-heading">Search Your Land By Type</h2>
            <p className="section-sub">
              Let our advisors help you find the perfect organic farming land — with in-depth soil assessments, water yield audits and full legal verification.
            </p>
          </motion.div>

          <div className="grid-builder-wrap">
            {categoryGrid.map((cat, i) => (
              <div key={i} className={`grid-item ${cat.span}`}>
                <div className="grid-item-bg-image" style={{ backgroundImage: `url(${cat.image})` }} />
                <Link href={`/properties?property_subtype=${cat.subtype}`} className="grid-item-link">
                  <div className="grid-item-content">
                    <div className="grid-item-subtitle">{cat.count}</div>
                    <h3 className="grid-item-title">{cat.name}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. RECENT LISTINGS ══════════════════ */}
      <section style={{ padding: '96px 0', background: 'var(--off-white)' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 32px' }}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 48 }}
          >
            <div style={{ maxWidth: 520 }}>
              <div className="section-chip"><TrendingUp style={{ width: 12, height: 12 }} /> New Listings</div>
              <h2 className="section-heading">Recently Added Properties</h2>
              <p className="section-sub">Discover fresh land listings across India — filtered by soil chemistry, water source or city.</p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', background: '#fff', padding: '5px', borderRadius: 999, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', gap: 4 }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'orchard', label: 'Orchards' },
                { id: 'plantation', label: 'Plantations' },
                { id: 'agricultural', label: 'Agro Plots' },
                { id: 'dry_land', label: 'Dry Lands' },
                { id: 'wet_land', label: 'Wet Lands' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 18px', borderRadius: 999, border: 'none',
                    fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: activeTab === tab.id ? 'var(--green)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                    boxShadow: activeTab === tab.id ? 'var(--shadow-green)' : 'none',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="spinner" />
            </div>
          ) : getFiltered().length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '80px 32px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <Sprout style={{ width: 56, height: 56, color: 'var(--text-faint)', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 24 }}>No listings found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No land listings match this filter. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {getFiltered().map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/properties" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', border: '1.5px solid var(--border)',
              borderRadius: 999, fontWeight: 700, fontSize: 14,
              color: 'var(--green)', background: '#fff',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
            }}>
              View All Properties <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════ 5. WHY CHOOSE US ══════════════════ */}
      <section style={{ padding: '96px 0', background: 'var(--off-white)' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 32px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <div className="section-chip"><CheckCircle style={{ width: 12, height: 12 }} /> Why Nature Lands</div>
            <h2 className="section-heading">Why Buyers Trust Us</h2>
            <p className="section-sub">Every listing is vetted through our 4-point assurance framework — before it appears on this portal.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {whyUs.map((w, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: '36px 28px',
                textAlign: 'center', boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(40,167,124,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'var(--green-muted)', color: 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>{w.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--text-dark)' }}>{w.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. TESTIMONIALS ══════════════════ */}
      <section style={{ padding: '96px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <img src="https://demo27.houzez.co/wp-content/uploads/2022/08/rating-stars.png" alt="5 star rating" style={{ height: 28, margin: '0 auto 14px' }} />
            <h2 className="section-heading">What Customers Are Saying</h2>
            <p className="section-sub">Hear from investors, farmers, and land buyers who found their perfect plot through Nature Lands.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} style={{ width: 16, height: 16, fill: '#f59e0b', color: '#f59e0b' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--text-body)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 28 }}>
                    "{t.text}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <img src={t.image} alt={t.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-dark)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. BLOG / GUIDES ══════════════════ */}
      <section style={{ padding: '96px 0', background: 'var(--navy)' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 56 }}>
            <div>
              <div className="section-chip" style={{ background: 'rgba(40,167,124,0.15)', color: 'var(--green-light)' }}>
                <Calendar style={{ width: 12, height: 12 }} /> Knowledge Hub
              </div>
              <h2 className="section-heading light">Guide for Buyers & Sellers</h2>
              <p className="section-sub light" style={{ maxWidth: 480 }}>
                Immediate access to the best agricultural land buying guides, water management audits, organic farming guidelines and investment insights.
              </p>
            </div>
            <Link href="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--green-light)', marginTop: 24 }}>
              View all articles <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {blogs.map((b, i) => (
              <Link key={i} href="/blogs" className="blog-card-dark" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="blog-card-dark__img">
                  <img src={b.image} alt={b.title} />
                  <span className="tag-chip" style={{ position: 'absolute', top: 14, left: 14 }}>{b.category}</span>
                </div>
                <div style={{ padding: '22px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Calendar style={{ width: 12, height: 12, color: 'var(--text-faint)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600 }}>{b.date}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>· {b.readTime} read</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 10, flex: 1 }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.excerpt}</p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-light)', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Continue reading <ArrowRight style={{ width: 12, height: 12 }} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. NEWSLETTER CTA ══════════════════ */}
      <section style={{ padding: '96px 0', background: 'var(--off-white)' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 32px' }}>
          <div className="newsletter-inner">
            <img className="bg-img" src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&fit=crop" alt="farmland sunset" />
            <div className="glow" />
            <div className="content">
              <span style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green-light)', marginBottom: 10 }}>
                Get Exclusive Offers
              </span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px,4vw,46px)', color: '#fff', marginBottom: 16, lineHeight: 1.15, fontWeight: 400 }}>
                Start Building Your Sustainable<br /><em>Farming Future</em> With Us
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 32, lineHeight: 1.7 }}>
                Subscribe for first access to new verified land listings, organic farming guides, and exclusive investment offers.
              </p>
              <form className="newsletter-form" onSubmit={e => { e.preventDefault(); alert('Thank you! We will be in touch.'); e.target.reset(); }}>
                <input type="email" placeholder="Enter your email address" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
