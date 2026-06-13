"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Buy Land', href: '/properties' },
  { label: 'Find an Agent', href: '/contact' },
  {
    label: 'More',
    href: '#',
    children: [
      { label: 'Blogs & Guides', href: '/blogs' },
      { label: 'About Us', href: '/about' },
    ]
  }
];

const LogoIcon = ({ headerTransparent }) => (
  <svg 
    className={`w-6 h-6 ${headerTransparent ? 'text-white' : 'text-[#0c3b2e]'}`} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const dropdownTimer = useRef(null);

  // Detect if we're on the homepage (transparent header needed)
  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOpen(false);
      setActiveDropdown(null);
      setShowUserMenu(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const headerTransparent = isHomepage && !scrolled;

  const handleMouseEnter = (label) => {
    clearTimeout(dropdownTimer.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  // SVG representation of Land.com's open-space logo is declared above

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        className={`hz-header transition-all duration-300 ${headerTransparent ? 'hz-header--transparent py-4' : 'hz-header--solid py-3 bg-[#0c3b2e] shadow-lg'}`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Left Navigation */}
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-white/80 !text-white"
                >
                  {link.label}
                  {link.children && <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
                </Link>

                {/* Dropdown */}
                {link.children && activeDropdown === link.label && (
                  <div
                    className="absolute top-full left-0 mt-2 min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-fade-in"
                    onMouseEnter={() => handleMouseEnter(link.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {link.children.map((child) => (
                      <Link 
                        key={child.label} 
                        href={child.href} 
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0c3b2e] rounded-lg transition-colors"
                        style={{ color: '#334155' }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Centered Logo */}
          <Link href="/" className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2" aria-label="Land.com">
            <LogoIcon headerTransparent={headerTransparent} />
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight !text-white">
              Land.com<span className="text-[10px] align-super">™</span>
            </span>
          </Link>

          {/* Right Navigation */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 !text-white"
                >
                  <span>{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 min-w-[160px] bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0c3b2e] rounded-lg"
                        style={{ color: '#334155' }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold hover:opacity-90 transition-opacity !text-white"
              >
                Sign In
              </Link>
            )}

            {/* Add a Listing CTA */}
            <Link 
              href="/admin" 
              className="px-5 py-2.5 border !border-white rounded-lg text-sm font-semibold hover:bg-white hover:text-[#0c3b2e] transition-all !text-white"
            >
              Add a Listing
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden !text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hz-mobile-overlay"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="hz-mobile-drawer bg-[#0c3b2e] text-white"
            >
              <div className="hz-mobile-drawer__header border-b border-white/10">
                <div className="flex items-center gap-2">
                  <LogoIcon headerTransparent={headerTransparent} />
                  <span className="font-serif text-xl font-bold text-white">Land.com™</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="hz-mobile-drawer__body py-6 px-6 space-y-4">
                {NAV_LINKS.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      className="block text-lg font-semibold hover:opacity-85"
                      onClick={() => !link.children && setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 mt-2 space-y-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block text-sm text-white/80 hover:text-white"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="hz-mobile-drawer__footer p-6 border-t border-white/10 space-y-4">
                {user ? (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full py-2.5 text-center text-sm font-semibold border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                  >
                    Logout
                  </button>
                ) : (
                  <Link 
                    href="/login" 
                    className="block w-full py-2.5 text-center text-sm font-semibold border border-white text-white rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
                <Link 
                  href="/admin" 
                  className="block w-full py-2.5 text-center text-sm font-semibold bg-white text-[#0c3b2e] rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Add a Listing
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
