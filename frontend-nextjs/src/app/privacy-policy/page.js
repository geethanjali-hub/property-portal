"use client";

import React from 'react';
import { Eye, Shield, Key } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8faf6] pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header card */}
        <div className="bg-[#0c3b2e] text-white rounded-3xl p-8 md:p-12 shadow-xl mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          <Shield className="w-12 h-12 mx-auto mb-4 text-[#ff914d]" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4 text-white">Privacy Policy</h1>
          <p className="text-emerald-100/80 font-medium max-w-xl mx-auto text-sm leading-relaxed">
            Last Updated: June 14, 2026. Your privacy and trust are our top priorities.
          </p>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-slate-700 leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              1. Information Collection
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              We collect information that you directly provide to us, including when you register an account, fill out the property &quot;I&quot;m Interested&quot; forms, submit contact requests, or otherwise communicate with us. This info may include your name, email address, and phone number.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              2. Use of Information
            </h2>
            <p className="text-sm text-slate-600 font-medium mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 font-medium">
              <li>Process interest forms and connect you with local Ramanagara property owners.</li>
              <li>Provide, maintain, and improve our services.</li>
              <li>Send you newsletters, updates, and marketing communications if consented.</li>
              <li>Monitor and analyze usage trends and website activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              3. Data Security
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              We implement reasonable administrative, technical, and physical safeguards designed to protect your personal data from unauthorized access, use, or disclosure. However, no internet transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              4. Third-Party Sharing
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              We do not sell, rent, or trade your personal information to third parties. We only share details with authorized listing brokers and owners of the land plots you have explicitly requested information for.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
