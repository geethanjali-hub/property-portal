"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Loader2, BookOpen, Clock } from 'lucide-react';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/blogs`);
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#D01F3C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Hero Section */}
      <section className="relative py-24 bg-[#0A0A0A] overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D01F3C]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D01F3C]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-[#D01F3C] font-black text-xs uppercase tracking-[0.5em] mb-6">Expert Insights</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
              The <span className="text-[#D01F3C]">Property</span> Journal.
            </h1>
            <p className="text-neutral-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              Discover the latest trends in Bangalore real estate, investment strategies, and home decor inspiration from our elite team of experts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex flex-col"
                >
                  <Link href={`/blogs/${blog.id}`} className="block relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    {blog.image_url ? (
                      <img 
                        src={blog.image_url} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-neutral-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Link>

                  <div className="flex items-center gap-4 mb-4 text-xs font-black uppercase tracking-widest text-[#D01F3C]">
                    <span className="flex items-center gap-1.5 bg-[#D01F3C]/5 px-3 py-1.5 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Clock className="w-3 h-3" />
                      5 min read
                    </span>
                  </div>

                  <Link href={`/blogs/${blog.id}`} className="group-hover:text-[#D01F3C] transition-colors">
                    <h2 className="text-2xl font-black text-neutral-900 mb-4 tracking-tight leading-snug line-clamp-2">
                      {blog.title}
                    </h2>
                  </Link>

                  <p className="text-neutral-500 font-medium text-sm leading-relaxed mb-8 line-clamp-3">
                    {blog.excerpt || 'Read the latest insights and updates from our real estate experts...'}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D01F3C] flex items-center justify-center text-white font-bold text-[10px]">
                        {blog.author_name?.[0] || 'A'}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">{blog.author_name}</span>
                    </div>
                    <Link 
                      href={`/blogs/${blog.id}`} 
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#D01F3C] group/link"
                    >
                      Read Full
                      <ArrowRight className="w-4 h-4 transition-transform group/link-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
              <BookOpen className="w-16 h-16 text-neutral-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-neutral-900 mb-2">The Journal is Empty</h3>
              <p className="text-neutral-500 font-medium">Check back soon for elite real estate insights.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default BlogListPage;
