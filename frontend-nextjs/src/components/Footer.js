import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Sprout } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  const cols = [
    {
      heading: 'Farming Lands',
      links: [
        { label: 'All Listings',        href: '/properties' },
        { label: 'Organic Orchards',    href: '/properties?property_subtype=orchard' },
        { label: 'Spice Plantations',   href: '/properties?property_subtype=plantation' },
        { label: 'Agricultural Plots',  href: '/properties?property_subtype=agricultural' },
        { label: 'Wet / Canal Lands',   href: '/properties?property_subtype=wet_land' },
        { label: 'Featured Listings',   href: '/properties?featured=true' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us',       href: '/about' },
        { label: 'Contact',        href: '/contact' },
        { label: 'Blog & Guides',  href: '/blogs' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Use',   href: '#' },
      ],
    },
  ];

  const socials = [
    { label: 'Facebook',  href: '#', icon: 'f' },
    { label: 'Instagram', href: '#', icon: '📷' },
    { label: 'LinkedIn',  href: '#', icon: 'in' },
    { label: 'X / Twitter', href: '#', icon: '𝕏' },
  ];

  return (
    <footer className="hz-footer" role="contentinfo">
      <div className="hz-footer__grid">
        {/* Brand */}
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--green), var(--green-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sprout style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', color: '#fff' }}>NATURE LANDS</div>
            </div>
          </Link>
          <p className="hz-footer__desc">
            India's most trusted organic land marketplace. Every listing is legally verified, soil-certified, and water-audited before it reaches you.
          </p>
          <div className="hz-footer__social">
            {socials.map(s => (
              <a key={s.label} href={s.href} className="hz-footer__social-link" aria-label={s.label}
                style={{ fontWeight: 700, fontSize: 12 }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map(col => (
          <div key={col.heading}>
            <div className="hz-footer__heading">{col.heading}</div>
            <ul className="hz-footer__links">
              {col.links.map(l => (
                <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div>
          <div className="hz-footer__heading">Get In Touch</div>
          <div className="hz-footer__contact-item">
            <MapPin className="hz-footer__contact-icon" />
            <span>No. 12, Nallamala Valley Foothills,<br />Mahabubnagar, Telangana 509001</span>
          </div>
          <div className="hz-footer__contact-item">
            <Phone className="hz-footer__contact-icon" />
            <a href="tel:+919876543210" style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}>+91 98765 43210</a>
          </div>
          <div className="hz-footer__contact-item">
            <Mail className="hz-footer__contact-icon" />
            <a href="mailto:contact@naturelands.com" style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', wordBreak: 'break-all' }}>
              contact@naturelands.com
            </a>
          </div>

          {/* Verified badge */}
          <div style={{
            marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(40,167,124,0.12)', border: '1px solid rgba(40,167,124,0.25)',
            borderRadius: 999, padding: '7px 14px',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--green-light)' }}>
              RERA Certified Listings
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 56 }}>
        <div className="hz-footer__bottom">
          <p className="hz-footer__copy">© {year} Nature Lands — Premium Real Estate Portal</p>
          <div className="hz-footer__bottom-links">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
