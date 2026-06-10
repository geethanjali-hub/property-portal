"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`}/contact`, formData);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Party Hall Location',
      details: ['Nature Party Hall', 'Beside Sri Kalyana Srinivasa Temple', 'Thimmegowdana Doddi Rd, Madapura, Ramanagara']
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 98765 43210', 'Direct Support Available']
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['booking@naturepartyhall.com']
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Sat: 9:00 AM - 7:00 PM', 'Sunday: By Appointment']
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Hero Section */}
      <section className="bg-[#0c162c] text-white py-32 relative overflow-hidden">
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-[#0A9BA2]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
        />
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-[#1976D2]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block text-[#0A9BA2] font-bold text-xs uppercase tracking-[0.3em] mb-6 bg-white/5 px-6 py-2.5 rounded-full border border-white/10">Booking Desk</span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">Plan Your <br/> Next <span className="text-[#0A9BA2] italic">Event.</span></h1>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
              Experience personalized event planning and hosting. Our team is ready to assist you in making your dream wedding or celebration a reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-[#f8fafc] px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-6 tracking-tight">Get in Touch</h2>
                <p className="text-slate-500 font-semibold leading-relaxed text-sm">
                  Our dedicated events team is here to help you with any questions about bookings, capacity, catering, and venue amenities.
                </p>
              </div>

              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-6 group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-[#0A9BA2] group-hover:text-white transition-all border border-slate-100">
                      <info.icon className="w-6 h-6 text-[#0A9BA2] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-slate-500 font-semibold text-xs leading-relaxed">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2rem] shadow-sm p-8 md:p-12 border border-slate-100">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                        <CheckCircle className="w-10 h-10 text-[#0A9BA2]" />
                      </div>
                      <h3 className="text-3xl font-bold text-slate-800 mb-4">Message Sent</h3>
                      <p className="text-slate-500 font-semibold mb-12 max-w-sm mx-auto text-sm">
                        Thank you for reaching out. Our event manager will contact you within 24 hours.
                      </p>
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setFormData({ name: '', email: '', phone: '', message: '' });
                        }}
                        className="bg-[#0A9BA2] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#087d83] transition-colors shadow-md"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">Send us a Message</h2>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#0A9BA2] outline-none transition-all font-semibold text-sm tracking-tight placeholder:text-slate-400"
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#0A9BA2] outline-none transition-all font-semibold text-sm tracking-tight placeholder:text-slate-400"
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#0A9BA2] outline-none transition-all font-semibold text-sm tracking-tight placeholder:text-slate-400"
                            placeholder="+91 98765 43210"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Requirements</label>
                          <textarea
                            required
                            rows={5}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:bg-white focus:border-[#0A9BA2] outline-none transition-all font-semibold text-sm tracking-tight placeholder:text-slate-400 resize-none"
                            placeholder="Tell us about your event, expected guest count, and dates..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-[#0A9BA2] text-white py-4 rounded-xl font-bold text-sm shadow-md hover:bg-[#087d83] transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-4"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <span>Send Message</span>
                              <Send className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[500px] bg-slate-200 grayscale hover:grayscale-0 transition-all duration-1000">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9695215948877!2d77.50715287427072!3d12.97380121483162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3c2e051372e9%3A0xaed83869ac7a0cc1!2s11th%20Block%2C%2011%20Block%2C%20702B%2C%2011th%20Block%2C%20Marilingappa%20Extension%2C%20Naagarabhaavi%2C%20Bengaluru%2C%20Karnataka%20560072!5e0!3m2!1sen!2sin!4v1774157252530!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Office Location"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactPage;
