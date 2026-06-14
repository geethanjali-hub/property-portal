"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Music, Radio } from 'lucide-react';

const Footer = () => {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const cols = [
    {
      heading: 'Real Estate For Sale by Type',
      links: [
        { label: 'Undeveloped Land for Sale', href: '/properties?property_subtype=acreage' },
        { label: 'Farms for Sale',      href: '/properties?property_subtype=farms' },
        { label: 'Ranches for Sale',    href: '/properties?property_subtype=ranches' },
        { label: 'Residential Property for Sale', href: '/properties?property_subtype=acreage' },
        { label: 'Lakefront Property for Sale',   href: '/properties?property_subtype=waterfront' },
        { label: 'More', href: '/properties' }
      ]
    },
    {
      heading: 'Real Estate For Sale by Region',
      links: [
        { label: 'Kanva Reservoir Area',    href: '/properties?search=Kanva' },
        { label: 'Closepet Hills Area',      href: '/properties?search=Closepet' },
        { label: 'Channapatna Border Area',  href: '/properties?search=Channapatna' },
        { label: 'Kengal Region',           href: '/properties?search=Kengal' },
        { label: 'Bidadi Region',           href: '/properties?search=Bidadi' },
        { label: 'More', href: '/properties' }
      ]
    },
    {
      heading: 'About Nature',
      links: [
        { label: 'About Us',       href: '/about' },
        { label: 'Contact Us',     href: '/contact' },
        { label: 'Terms of Use',   href: '/terms-of-use' },
        { label: 'Privacy Notice', href: '/privacy-policy' },
        { label: 'Cookie Policy',  href: '/cookie-policy' },
        { label: 'Exercise Your Privacy Rights', href: '#' }
      ]
    },
    {
      heading: 'For Partners',
      links: [
        { label: 'Advertise a Listing',  href: '/admin' },
        { label: 'Advertise a Business', href: '#' },
        { label: 'Rural Land Analytics', href: '#' },
        { label: 'Manage Listings',      href: '/admin' }
      ]
    }
  ];

  return (
    <footer className="bg-[#0b221a] text-white/70 py-14 border-t border-white/10 font-sans" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {cols.map((col, i) => (
          <div key={i}>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-5">{col.heading}</h4>
            <ul className="space-y-3">
              {col.links.map((link, j) => (
                <li key={j}>
                  <Link href={link.href} className="text-sm font-medium hover:text-white hover:underline transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs font-semibold">
          &copy; {year} Nature Portal (India)
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" aria-label="Twitter/X" className="hover:text-white transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="#" aria-label="YouTube" className="hover:text-white transition-colors">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" aria-label="TikTok" className="hover:text-white transition-colors">
            <Music className="w-5 h-5" />
          </a>
          <a href="#" aria-label="Spotify" className="hover:text-white transition-colors">
            <Radio className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
