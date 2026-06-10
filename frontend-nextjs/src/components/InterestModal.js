"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2, CheckCircle, Phone, Mail, User, MapPin, ShieldCheck, Zap, Sparkles, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const InterestModal = ({ isOpen, onClose, property }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
      await axios.post(`${API_URL}/api/properties/interest`, {
        property_id: property.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      setSubmitted(true);
      toast.success('Interest registered successfully! Agricultural consultant assigned.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Handshake failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', phone: '' });
    onClose();
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price?.toLocaleString()}`;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px] border border-slate-100"
        >
          {/* Left Side: Property Preview */}
          <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#0c162c] to-[#0A9BA2] relative p-12 flex-col justify-between text-white overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1976D2]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full w-fit mb-8 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#0A9BA2] animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Soil & Water Audit</span>
              </div>

              <h3 className="text-3xl font-extrabold leading-tight tracking-tight mb-4 text-white">{property?.title}</h3>
              <div className="flex items-center text-slate-300 font-bold tracking-tight text-xs mb-8">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#0A9BA2]" />
                <span>{property?.area}, {property?.city}</span>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Valuation</p>
                <p className="text-3xl font-black tracking-tight text-white">
                  {formatPrice(property?.price)}
                </p>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#0A9BA2]" />
                <span>Certified Organic Farming Land</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-grow p-8 md:p-14 bg-white relative flex flex-col justify-center">
            <button
              onClick={handleClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all active:scale-90 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-w-md mx-auto w-full">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                    key="success"
                  >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-200">
                      <CheckCircle className="w-10 h-10 text-[#0A9BA2]" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-4">Request Registered</h3>
                    <p className="text-slate-500 font-semibold mb-10 leading-relaxed text-sm">
                      Our certified agronomist for <span className="text-slate-800 underline">{property?.city}</span> will call you back within 2 hours with soil analysis and land details.
                    </p>
                    <button
                      onClick={handleClose}
                      className="bg-[#0A9BA2] text-white w-full py-4 rounded-xl font-bold text-sm hover:bg-[#087d83] transition-colors cursor-pointer shadow-lg shadow-[#0A9BA2]/10"
                    >
                      Return to Portfolio
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                    key="form"
                  >
                    <div>
                      <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Secure Soil Inquiry</h3>
                      <p className="text-slate-500 font-semibold text-sm">Register your coordinates to verify title deeds and soil studies.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A9BA2] transition-colors" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold tracking-tight focus:bg-white focus:border-[#0A9BA2] outline-none transition-all placeholder:text-slate-400"
                          placeholder="Full Name"
                        />
                      </div>

                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A9BA2] transition-colors" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold tracking-tight focus:bg-white focus:border-[#0A9BA2] outline-none transition-all placeholder:text-slate-400"
                          placeholder="Email Address"
                        />
                      </div>

                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A9BA2] transition-colors" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold tracking-tight focus:bg-white focus:border-[#0A9BA2] outline-none transition-all placeholder:text-slate-400"
                          placeholder="Mobile Number"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0A9BA2] text-white py-4 rounded-xl font-bold text-sm shadow-md hover:bg-[#087d83] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer mt-4"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-current" />
                            <span>Initialize Callback</span>
                          </>
                        )}
                      </button>
                    </form>

                    <div className="flex items-center justify-center space-x-2 text-slate-400">
                      <Sparkles className="w-4 h-4 text-[#0A9BA2] opacity-75 animate-bounce" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Confidential · Direct · Certified</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterestModal;
