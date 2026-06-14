"use client";

import React from 'react';
import { ShieldAlert, CheckCircle, Scale } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#f8faf6] pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header card */}
        <div className="bg-[#0c3b2e] text-white rounded-3xl p-8 md:p-12 shadow-xl mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          <Scale className="w-12 h-12 mx-auto mb-4 text-[#ff914d]" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4 text-white">Terms of Use</h1>
          <p className="text-emerald-100/80 font-medium max-w-xl mx-auto text-sm leading-relaxed">
            Last Updated: June 14, 2026. Please read these terms carefully before using the Nature Portal.
          </p>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-slate-700 leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              1. Acceptance of Terms
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              By accessing and using the Nature Portal (the &quot;Site&quot;), you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              2. Use License
            </h2>
            <p className="text-sm text-slate-600 font-medium mb-3">
              Permission is granted to temporarily view the materials (information or listings) on Nature Portal for personal, non-commercial transitory viewing only. Under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 font-medium">
              <li>Modify or copy the materials.</li>
              <li>Use the materials for any commercial purpose or public display.</li>
              <li>Attempt to decompile or reverse engineer any software contained on the site.</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              3. Listing Disclaimer
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              The property listings on the Site are provided for informational purposes only. While we endeavor to verify titles and plot details for Ramanagara lands, users are advised to perform independent legal title checks and soil inspections before entering into any land transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              4. Limitations of Liability
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              In no event shall Nature Portal or its partners be liable for any damages arising out of the use or inability to use the listings or materials on the Site, even if notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#ff914d] rounded-full"></span>
              5. Governing Law
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Any claim relating to Nature Portal shall be governed by the laws of the State of Karnataka, India, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
