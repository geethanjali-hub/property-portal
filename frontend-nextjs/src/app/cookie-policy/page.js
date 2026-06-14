"use client";

import React from 'react';
import { Eye, Shield, Key } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#f8faf6] pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header card */}
        <div className="bg-[#0c3b2e] text-white rounded-3xl p-8 md:p-12 shadow-xl mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          <Key className="w-12 h-12 mx-auto mb-4 text-[#ff914d]" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4 text-white">Cookie Policy</h1>
          <p className="text-emerald-100/80 font-medium max-w-xl mx-auto text-sm leading-relaxed">
            Last Updated: June 14, 2026. Learn how we use cookies to improve your user experience.
          </p>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-slate-700 leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              1. What Are Cookies?
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Cookies are small text files that are stored on your computer or mobile device when you visit websites. They help websites recognize your device, remember preferences, and analyze usage trends.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              2. How We Use Cookies
            </h2>
            <p className="text-sm text-slate-600 font-medium mb-3">
              We use cookies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 font-medium">
              <li>Keep you signed in if you have created an admin or owner account.</li>
              <li>Analyze general usage metrics and mapping performance.</li>
              <li>Save local preferences (e.g. filters and viewing mode preferences).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              3. Managing Cookies
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer be personalized to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
