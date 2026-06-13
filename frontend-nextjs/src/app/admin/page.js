"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';
import { MessageSquare, Mail, ArrowRight, Home, Loader2, ShieldCheck, TrendingUp, Clock, BookOpen, Sprout } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
        const response = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b221a]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#ff914d]" />
          <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Accessing Command Center...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    { title: 'Farming Lands', value: stats?.total_properties || 0, icon: Sprout, color: 'from-[#0c3b2e] to-[#0b221a]', link: '/admin/properties', desc: 'Active Listings' },
    { title: 'Prospect Leads', value: stats?.total_interests || 0, icon: MessageSquare, color: 'from-[#ff914d] to-[#e67e35]', link: '/admin/interests', desc: 'Buyer Leads' },
    { title: 'Inquiries', value: stats?.total_contacts || 0, icon: Mail, color: 'from-[#6d9773] to-[#4e7253]', link: '/admin/contacts', desc: 'Total Inquiries' },
    { title: 'Pending', value: stats?.unread_contacts || 0, icon: Clock, color: 'from-[#d32f2f] to-[#b71c1c]', link: '/admin/contacts', desc: 'Unread Messages' },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf6] font-sans text-slate-800">
      {/* Premium Header Section */}
      <div className="bg-[#0b221a] pt-20 pb-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#ff914d]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#6d9773]/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 w-10 h-10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#ff914d]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff914d]">System Administrator</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold !text-white tracking-tight" style={{ color: '#ffffff' }}>Command <span className="text-[#ff914d]">Center.</span></h1>
              <p className="text-slate-300 font-medium max-w-md text-sm">Welcome back, {user?.name}. Managing your premium certified farming lands network.</p>
            </div>
            
            <div className="flex items-center space-x-4">
               <Link href="/" className="px-8 py-4 bg-[#0c3b2e] border border-white/10 hover:bg-[#ff914d] !text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center space-x-2 cursor-pointer" style={{ color: '#ffffff' }}>
                 <Home className="w-4 h-4" />
                 <span>View Website</span>
               </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Admin Tab Navigation Bar */}
      <div className="bg-[#0b221a] text-white/80 border-t border-b border-white/10 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-1">
          <Link href="/admin" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 border-[#ff914d] text-white bg-white/5 transition-all">
            Dashboard
          </Link>
          <Link href="/admin/properties" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all">
            Manage Listings
          </Link>
          <Link href="/admin/interests" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all">
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

      <div className="max-w-7xl mx-auto px-6 mt-12 pb-20 relative z-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <Link key={index} href={stat.link} className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-500 border border-slate-200/60 flex flex-col justify-between h-full hover:-translate-y-1 cursor-pointer">
              <div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-md`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2 group-hover:text-[#ff914d] transition-colors">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.title}</div>
                <div className="text-[11px] font-semibold text-slate-500">{stat.desc}</div>
              </div>
              <div className="mt-8 flex items-center justify-between text-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manage All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform text-[#ff914d]" />
              </div>
            </Link>
          ))}
        </div>

        {/* Analytics & Quick Actions Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Performance */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-10 shadow-sm border border-slate-200/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6d9773]/5 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-serif">Farming Asset Distribution</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Real-time category stats</p>
                </div>
                <TrendingUp className="w-7 h-7 text-[#0c3b2e]" />
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="bg-[#f8faf6] border border-slate-100 rounded-3xl p-8 hover:bg-white hover:shadow-md transition-all duration-500">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0c3b2e]">Orchards</span>
                    <span className="text-3xl font-black text-slate-800">{stats?.residential_properties || 0}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-[#0c3b2e] h-2 rounded-full" 
                      style={{ width: stats?.total_properties ? String((stats.residential_properties / stats.total_properties) * 100) + '%' : '0%' }}
                    ></div>
                  </div>
                  <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Share</p>
                  <p className="text-slate-500 text-xs font-semibold">Mango & fruit orchards vs total lands</p>
                </div>

                <div className="bg-[#f8faf6] border border-slate-100 rounded-3xl p-8 hover:bg-white hover:shadow-md transition-all duration-500">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#ff914d]">Plantations</span>
                    <span className="text-3xl font-black text-slate-800">{stats?.commercial_properties || 0}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-[#ff914d] h-2 rounded-full" 
                      style={{ width: stats?.total_properties ? String((stats.commercial_properties / stats.total_properties) * 100) + '%' : '0%' }}
                    ></div>
                  </div>
                  <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Spice & Forestry</p>
                  <p className="text-slate-500 text-xs font-semibold">Spice plantations vs total lands</p>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col sm:flex-row gap-6">
                 <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4 text-[#0c3b2e]">
                       <Sprout className="w-5 h-5 text-[#ff914d]" />
                       <span className="text-sm font-bold uppercase tracking-wider">Agronomy Focus</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-semibold">Your current lead conversion rate is healthy. Focus on verifying title deeds, water capacity, and soil reports for newly added agricultural plots to maintain high engagement.</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Access Menu */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight px-2 font-serif">Rapid Access</h3>
            <div className="space-y-4">
              {[
                { title: 'Manage Listings', icon: Sprout, link: '/admin/properties', color: 'text-[#0c3b2e]' },
                { title: 'Prospect Leads', icon: MessageSquare, link: '/admin/interests', color: 'text-[#ff914d]' },
                { title: 'Inquiry Inbox', icon: Mail, link: '/admin/contacts', color: 'text-purple-600' },
                { title: 'Blog Articles', icon: BookOpen, link: '/admin/blogs', color: 'text-[#6d9773]' },
              ].map((item, i) => (
                <Link key={i} href={item.link} className="flex items-center justify-between p-6 bg-white border border-slate-200/60 rounded-3xl hover:border-[#ff914d] transition-all group shadow-sm hover:shadow-md cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#0c3b2e]/5 transition-colors">
                      <item.icon className={`w-5 h-5 ${item.color} transition-colors`} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#ff914d] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="p-8 bg-[#0c3b2e] rounded-3xl text-white space-y-4 shadow-md relative overflow-hidden border border-[#ff914d]/10">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff914d]/10 rounded-full blur-[40px]"></div>
               <div className="relative z-10">
                 <h4 className="font-bold text-sm uppercase tracking-wider text-[#ff914d]">Agronomy Support</h4>
                 <p className="text-[11px] font-semibold text-white/80 leading-relaxed uppercase tracking-wider mt-1">Need help with soil data or water verification? Consult support.</p>
                 <button className="w-full py-3.5 bg-white text-[#0c3b2e] hover:bg-[#ff914d] hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer mt-4">Consult Support</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
