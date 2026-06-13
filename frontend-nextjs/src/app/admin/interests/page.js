"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';
import { ArrowLeft, MessageSquare, Phone, Mail, Building2, Calendar, Search, Loader2 } from 'lucide-react';

const AdminInterests = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const fetchInterests = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isAdmin) return;
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
      try {
        const response = await axios.get(`${API_URL}/api/admin/interests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInterests(response.data);
      } catch (error) {
        console.error('Error fetching interests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterests();
  }, [isAdmin]);

  const filteredInterests = interests.filter(interest =>
    interest.name.toLowerCase().includes(search.toLowerCase()) ||
    interest.email.toLowerCase().includes(search.toLowerCase()) ||
    interest.property_title?.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b221a]">
        <Loader2 className="w-12 h-12 animate-spin text-[#ff914d]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8faf6] font-sans text-slate-800">
      {/* Header */}
      <div className="bg-[#0b221a] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff914d]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6d9773]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="w-12 h-12 bg-[#0c3b2e] border border-white/10 hover:bg-[#ff914d] !text-white rounded-2xl flex items-center justify-center transition-all group backdrop-blur-md cursor-pointer" style={{ color: '#ffffff' }}>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-4xl font-serif font-bold !text-white tracking-tight" style={{ color: '#ffffff' }}>Prospect <span className="text-[#ff914d]">Leads.</span></h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{interests.length} total submissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Admin Tab Navigation Bar */}
      <div className="bg-[#0b221a] text-white/80 border-t border-b border-white/10 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-1">
          <Link href="/admin" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all">
            Dashboard
          </Link>
          <Link href="/admin/properties" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all">
            Manage Listings
          </Link>
          <Link href="/admin/interests" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 border-[#ff914d] text-white bg-white/5 transition-all">
            Prospect Leads
          </Link>
          <Link href="/admin/contacts" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all">
            Inquiry Inbox
          </Link>
          <Link href="/admin/blogs" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all">
            Blog Articles
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Search */}
        <div className="mb-12 relative max-w-md w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#ff914d] transition-colors" />
          <input
            type="text"
            placeholder="Search by prospect name or asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-neutral-100 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] focus:shadow-xl focus:border-[#ff914d]/20 outline-none transition-all font-bold text-sm"
          />
        </div>

        {/* Interests Grid */}
        {filteredInterests.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border border-dashed border-neutral-200">
            <MessageSquare className="w-16 h-16 text-neutral-200 mx-auto mb-6" />
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No interest logs discovered</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredInterests.map((interest) => (
              <div key={interest.id} className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-neutral-50 hover:border-[#ff914d]/20 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-[#0c3b2e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff914d]/10">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-neutral-900 tracking-tight">{interest.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Prospect Identified</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      <div className="flex items-center space-x-3 group/item">
                        <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover/item:bg-[#ff914d]/5 transition-colors">
                          <Building2 className="w-4 h-4 text-neutral-400 group-hover/item:text-[#ff914d]" />
                        </div>
                        <span className="text-sm font-bold text-neutral-600 line-clamp-1">{interest.property_title || 'Private Asset'}</span>
                      </div>
                      <div className="flex items-center space-x-3 group/item">
                        <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover/item:bg-[#ff914d]/5 transition-colors">
                          <Mail className="w-4 h-4 text-neutral-400 group-hover/item:text-[#ff914d]" />
                        </div>
                        <a href={`mailto:${interest.email}`} className="text-sm font-bold text-neutral-600 hover:text-[#ff914d] transition-colors">{interest.email}</a>
                      </div>
                      <div className="flex items-center space-x-3 group/item">
                        <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover/item:bg-[#ff914d]/5 transition-colors">
                          <Phone className="w-4 h-4 text-neutral-400 group-hover/item:text-[#ff914d]" />
                        </div>
                        <a href={`tel:${interest.phone}`} className="text-sm font-bold text-neutral-600 hover:text-[#ff914d] transition-colors">{interest.phone}</a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[200px]">
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50 px-4 py-2 rounded-xl">
                      <Calendar className="w-3 h-3 mr-2" />
                      {new Date(interest.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                      <a
                        href={`mailto:${interest.email}`}
                        className="flex-1 md:flex-none px-8 py-4 bg-[#0c3b2e] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff914d] transition-all shadow-lg shadow-[#ff914d]/10 text-center"
                      >
                        Email
                      </a>
                      <a
                        href={`tel:${interest.phone}`}
                        className="flex-1 md:flex-none px-8 py-4 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all text-center"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInterests;
