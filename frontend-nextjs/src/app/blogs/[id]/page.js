"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, ArrowRight, Loader2, BookOpen, Clock, Share2, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';

const BlogDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
        const response = await fetch(`${API_URL}/api/blogs/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBlog(data);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setBlog(null); // Ensure blog is null on error
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#D01F3C]" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-neutral-300" />
        </div>
        <h1 className="text-3xl font-black text-neutral-900 mb-4">Article Not Found</h1>
        <p className="text-neutral-500 mb-8 max-w-md text-center">The blog post you&apos;re looking for might have been moved or deleted.</p>
        <Link href="/blogs" className="bg-[#D01F3C] text-white px-10 py-4 rounded-xl font-bold flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-poppins pb-24">
      {/* Header / Hero */}
      <section className="relative pt-32 pb-24 bg-[#0A0A0A] overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D01F3C]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/blogs" className="inline-flex items-center text-[#D01F3C] font-black text-[10px] uppercase tracking-[0.4em] mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Journal
            </Link>
            
            <div className="flex items-center gap-4 mb-8 text-xs font-black uppercase tracking-[0.2em] text-white/60">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                <Calendar className="w-3 h-3 text-[#D01F3C]" />
                {new Date(blog.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#D01F3C]" />
                5 Min Read
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 leading-[1.1]">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 border-t border-white/10 pt-10">
              <div className="w-14 h-14 rounded-full bg-[#D01F3C] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-[#D01F3C]/20 border-2 border-white/20">
                {blog.author_name?.[0] || 'A'}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#D01F3C]">Author</p>
                <p className="text-lg font-bold text-white tracking-tight">{blog.author_name || 'Make My Propertyz Team'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {blog.image_url && (
        <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white"
          >
            <img 
              src={blog.image_url} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      )}

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-neutral-100">
              <div className="prose prose-lg max-w-none text-neutral-600 font-medium leading-relaxed">
                {/* Handle basic line breaks, for a real app we'd use a markdown parser */}
                {blog.content.split('\n').map((para, i) => (
                  <p key={i} className="mb-6">{para}</p>
                ))}
              </div>

              {/* Tags/Categories placeholder */}
              <div className="mt-12 pt-12 border-t border-neutral-100 flex flex-wrap gap-3">
                {['Real Estate', 'Bangalore', 'Investments', 'Home Buying'].map(tag => (
                   <span key={tag} className="px-4 py-2 bg-neutral-50 text-neutral-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#D01F3C]/5 hover:text-[#D01F3C] transition-colors cursor-pointer">
                     #{tag}
                   </span>
                ))}
              </div>
            </div>

            {/* Engagement */}
            <div className="mt-12 flex items-center justify-between p-8 bg-[#0A0A0A] rounded-[2.5rem] text-white">
              <div className="flex items-center gap-6">
                <p className="text-sm font-black uppercase tracking-widest text-white/60">Share Insights</p>
                <div className="flex gap-4">
                  <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D01F3C] transition-colors"><Facebook className="w-4 h-4" /></button>
                  <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D01F3C] transition-colors"><Twitter className="w-4 h-4" /></button>
                  <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D01F3C] transition-colors"><Linkedin className="w-4 h-4" /></button>
                </div>
              </div>
              <button className="hidden sm:flex items-center gap-2 bg-[#D01F3C] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#D01F3C]/20 hover:scale-105 active:scale-95 transition-all">
                <Share2 className="w-4 h-4" />
                Copy Link
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            {/* Search Box */}
            <div className="bg-neutral-50 rounded-[2rem] p-8 border border-neutral-100">
              <h4 className="text-lg font-black text-neutral-900 mb-6 tracking-tight">Search Journal</h4>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Keywords..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-[#D01F3C]/20 transition-all text-sm font-medium"
                />
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-5 h-5" />
              </div>
            </div>

            {/* CTA Sidebar */}
            <div className="bg-gradient-to-br from-[#D01F3C] to-[#B01A33] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-[#D01F3C]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                 <h4 className="text-2xl font-black mb-4 tracking-tight leading-tight">Ready to Find Your Dream Home?</h4>
                 <p className="text-white/80 font-medium text-sm mb-8">Browse Bangalore&apos;s most exclusive properties today.</p>
                 <Link href="/properties" className="w-full bg-white text-[#D01F3C] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl hover:bg-neutral-50 transition-colors">
                    View Listings
                    <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>

            {/* Sidebar Contact (Optional/Placeholder) */}
            <div className="bg-[#0A0A0A] rounded-[2rem] p-8 text-white">
               <div className="flex items-center gap-3 mb-6">
                 <MessageSquare className="w-6 h-6 text-[#D01F3C]" />
                 <h4 className="text-lg font-black tracking-tight">Need Expert Advice?</h4>
               </div>
               <p className="text-white/40 text-sm font-medium mb-6 leading-relaxed italic">&quot;Our consultants are available 24/7 to guide you through your property journey.&quot;</p>
               <Link href="/contact" className="w-full bg-[#D01F3C] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center">Get in Touch</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
