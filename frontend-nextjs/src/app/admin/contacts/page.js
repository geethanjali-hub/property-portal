"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';
import { ArrowLeft, Mail, Phone, Calendar, Search, Check, MessageSquare, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

const AdminContacts = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    fetchContacts();
  }, [isAdmin]);

  const fetchContacts = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isAdmin) return;
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
    try {
      const response = await axios.get(`${API_URL}/api/contact`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
      await axios.put(`${API_URL}/api/admin/contacts/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Message archived as read');
      fetchContacts();
    } catch (error) {
      toast.error('System synchronization failed');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase()) ||
    contact.message.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = contacts.filter(c => !c.is_read).length;

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
              <h1 className="text-4xl font-black tracking-tighter">Communications <span className="opacity-70">Vault.</span></h1>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">{contacts.length} transmissions, {unreadCount} awaiting clearance</p>
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
            placeholder="Search data records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-neutral-100 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] focus:shadow-xl focus:border-[#D01F3C]/20 outline-none transition-all font-bold text-sm"
          />
        </div>

        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border border-dashed border-neutral-200">
            <Mail className="w-16 h-16 text-neutral-200 mx-auto mb-6" />
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Communication logs clear</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id} 
                className={`bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border transition-all ${!contact.is_read ? 'border-[#D01F3C]/30 bg-[#D01F3C]/[0.02]' : 'border-neutral-50'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${!contact.is_read ? 'bg-[#D01F3C] shadow-[#D01F3C]/20' : 'bg-neutral-100'}`}>
                        <User className={`w-6 h-6 ${!contact.is_read ? 'text-white' : 'text-neutral-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-black text-neutral-900 tracking-tight">{contact.name}</h3>
                          {!contact.is_read && (
                            <span className="px-3 py-1 bg-[#D01F3C] text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#D01F3C]/20">Priority</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-6 mt-1">
                          <a href={`mailto:${contact.email}`} className="text-xs font-bold text-[#D01F3C] hover:opacity-80 transition-opacity uppercase tracking-widest">{contact.email}</a>
                          <span className="text-[10px] text-neutral-300">|</span>
                          <a href={`tel:${contact.phone}`} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-widest flex items-center">
                            <Phone className="w-3 h-3 mr-2" />
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100/50">
                      <p className="text-neutral-700 font-medium text-sm leading-relaxed whitespace-pre-wrap">{contact.message}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-4 min-w-[220px]">
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50 px-4 py-2 rounded-xl">
                      <Calendar className="w-3 h-3 mr-2" />
                      {new Date(contact.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    <div className="flex flex-col w-full space-y-3">
                      {!contact.is_read && (
                        <button
                          onClick={() => markAsRead(contact.id)}
                          className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-white border border-neutral-100 text-neutral-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#D01F3C] hover:text-[#D01F3C] transition-all shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Clear Record</span>
                        </button>
                      )}
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center justify-center w-full px-8 py-4 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D01F3C] transition-all shadow-xl shadow-black/5"
                      >
                        Secure Reply
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

export default AdminContacts;
