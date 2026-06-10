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
        const response = await axios.get(`${API_URL}/api/properties/interests`, {
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#D01F3C]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D01F3C] to-[#B01A33] text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="w-12 h-12 bg-white/20 border border-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all group backdrop-blur-md">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">Interest <span className="opacity-70">Repository.</span></h1>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">{interests.length} Total Submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Search */}
        <div className="mb-12 relative max-w-md w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#D01F3C] transition-colors" />
          <input
            type="text"
            placeholder="Search by prospect name or asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-neutral-100 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] focus:shadow-xl focus:border-[#D01F3C]/20 outline-none transition-all font-bold text-sm"
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
              <div key={interest.id} className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-neutral-50 hover:border-[#D01F3C]/20 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-[#D01F3C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D01F3C]/20">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-neutral-900 tracking-tight">{interest.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Prospect Identified</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      <div className="flex items-center space-x-3 group/item">
                        <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover/item:bg-[#D01F3C]/5 transition-colors">
                          <Building2 className="w-4 h-4 text-neutral-400 group-hover/item:text-[#D01F3C]" />
                        </div>
                        <span className="text-sm font-bold text-neutral-600 line-clamp-1">{interest.property_title || 'Private Asset'}</span>
                      </div>
                      <div className="flex items-center space-x-3 group/item">
                        <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover/item:bg-[#D01F3C]/5 transition-colors">
                          <Mail className="w-4 h-4 text-neutral-400 group-hover/item:text-[#D01F3C]" />
                        </div>
                        <a href={`mailto:${interest.email}`} className="text-sm font-bold text-neutral-600 hover:text-[#D01F3C] transition-colors">{interest.email}</a>
                      </div>
                      <div className="flex items-center space-x-3 group/item">
                        <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover/item:bg-[#D01F3C]/5 transition-colors">
                          <Phone className="w-4 h-4 text-neutral-400 group-hover/item:text-[#D01F3C]" />
                        </div>
                        <a href={`tel:${interest.phone}`} className="text-sm font-bold text-neutral-600 hover:text-[#D01F3C] transition-colors">{interest.phone}</a>
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
                        className="flex-1 md:flex-none px-8 py-4 bg-[#D01F3C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#B01A33] transition-all shadow-lg shadow-[#D01F3C]/10 text-center"
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
