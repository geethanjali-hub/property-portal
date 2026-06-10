"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  Menu, X, User, LogOut, Settings, ChevronDown,
  Phone, Sprout, Heart, Plus
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_LINKS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Lands',
    href: '/properties',
    children: [
      { label: 'All Lands', href: '/properties' },
      { label: 'Orchards', href: '/properties?property_subtype=orchard' },
      { label: 'Plantations', href: '/properties?property_subtype=plantation' },
      { label: 'Agricultural Plots', href: '/properties?property_subtype=agricultural' },
      { label: 'Dry Lands', href: '/properties?property_subtype=dry_land' },
      { label: 'Wet Lands', href: '/properties?property_subtype=wet_land' },
    ],
  },
  { label: 'Blogs', href: '/blogs' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

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

  // Close dropdowns when route changes
  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setShowUserMenu(false);
  }, [pathname]);

  const headerTransparent = isHomepage && !scrolled;

  const handleMouseEnter = (label) => {
    clearTimeout(dropdownTimer.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <>
      {/* ─── DESKTOP HEADER ─── */}
      <header
        className={`hz-header ${headerTransparent ? 'hz-header--transparent' : 'hz-header--solid'}`}
        role="banner"
      >
        <div className="hz-header__inner">
          {/* Logo */}
          <Link href="/" className="hz-header__logo" aria-label="Nature Lands">
            {headerTransparent ? (
              <div className="hz-logo-white">
                <Sprout className="hz-logo-icon" />
                <div className="hz-logo-text">
                  <span className="hz-logo-brand">NATURE LANDS</span>
                </div>
              </div>
            ) : (
              <div className="hz-logo-color">
                <div className="hz-logo-icon-wrap">
                  <Sprout className="hz-logo-icon-green" />
                </div>
                <div className="hz-logo-text">
                  <span className="hz-logo-brand-green">NATURE LANDS</span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hz-header__nav" role="navigation" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="hz-nav-item"
                onMouseEnter={() => link.children && handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={link.href}
                  className={`hz-nav-link ${headerTransparent ? 'hz-nav-link--light' : 'hz-nav-link--dark'} ${pathname === link.href ? 'hz-nav-link--active' : ''}`}
                >
                  {link.label}
                  {link.children && <ChevronDown className="hz-nav-chevron" />}
                </Link>

                {/* Dropdown */}
                {link.children && activeDropdown === link.label && (
                  <div
                    className="hz-dropdown"
                    onMouseEnter={() => handleMouseEnter(link.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {link.children.map((child) => (
                      <Link key={child.label} href={child.href} className="hz-dropdown__item">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hz-header__actions">
            {/* Phone */}
            <a
              href="tel:+918001234567"
              className={`hz-phone-link ${headerTransparent ? 'hz-phone-link--light' : 'hz-phone-link--dark'}`}
            >
              <Phone className="hz-phone-icon" />
              <span className="hz-phone-number">+91 800 123 4567</span>
            </a>

            {/* User / Login */}
            <div className="hz-user-wrap">
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`hz-user-btn ${headerTransparent ? 'hz-user-btn--light' : 'hz-user-btn--dark'}`}
                  aria-expanded={showUserMenu}
                >
                  <User className="w-4 h-4" />
                  <span>{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className={`hz-user-btn ${headerTransparent ? 'hz-user-btn--light' : 'hz-user-btn--dark'}`}
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* User dropdown */}
              {showUserMenu && user && (
                <div className="hz-user-dropdown">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="hz-user-dropdown__item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 text-[#28a77c]" />
                      Admin Console
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="hz-user-dropdown__item hz-user-dropdown__item--danger"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* List Your Land CTA */}
            <Link href="/admin" className="hz-cta-btn">
              <Plus className="w-3.5 h-3.5" />
              List Your Land
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`hz-hamburger ${headerTransparent ? 'hz-hamburger--light' : 'hz-hamburger--dark'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ─── MOBILE DRAWER ─── */}
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
              transition={{ type: 'tween', duration: 0.28 }}
              className="hz-mobile-drawer"
            >
              <div className="hz-mobile-drawer__header">
                <div className="hz-logo-color">
                  <div className="hz-logo-icon-wrap">
                    <Sprout className="hz-logo-icon-green" />
                  </div>
                  <div className="hz-logo-text">
                    <span className="hz-logo-brand-green">NATURE LANDS</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="hz-mobile-drawer__close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="hz-mobile-drawer__body">
                {NAV_LINKS.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      className={`hz-mobile-nav-link ${pathname === link.href ? 'hz-mobile-nav-link--active' : ''}`}
                      onClick={() => !link.children && setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="hz-mobile-sub">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="hz-mobile-sub-link"
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

              <div className="hz-mobile-drawer__footer">
                <a href="tel:+918001234567" className="hz-mobile-phone">
                  <Phone className="w-4 h-4" />
                  +91 800 123 4567
                </a>
                <Link href="/admin" className="hz-cta-btn w-full justify-center" onClick={() => setMobileOpen(false)}>
                  <Plus className="w-3.5 h-3.5" />
                  List Your Land
                </Link>
                {user ? (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="hz-mobile-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <Link href="/login" className="hz-mobile-login" onClick={() => setMobileOpen(false)}>
                    <User className="w-4 h-4" />
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
