"use client";

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// SEO metadata in Next.js App Router must be in a layout.js or page.js (server component)
// Since this page uses "use client", we'll export metadata from a separate file or use a wrapper.
// However, for simplicity and within this file context, I'll provide the metadata as a comment 
// and suggest moving it to a layout or making this a server component with a client wrapper.

/*
export const metadata = {
  title: "Contact Us | Make My Propertyz",
  description: "Get in touch with Make My Propertyz for any property inquiries in Bangalore. Our team is here to help you find your dream home.",
  keywords: ["contact make my propertyz", "real estate support Bangalore"],
};
*/

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
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
      const response = await axios.post(`${API_URL}/api/contact`, {
formData});
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Corporate Office',
      details: ['7, Jnanabharathi BDA Layout', 'Jnana Ganga Nagar', 'Bengaluru, Karnataka 560056']
    },
    {
      icon: MapPin,
      title: 'Branch Office',
      details: ['2nd floor, No 702', 'Nagarabhavi 2nd Stage, 11th Block', 'Marilingappa Extension, Naagarabhaavi', 'Bengaluru, Karnataka 560072']
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 85510 78551', 'Direct Support Available']
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['contact@natureportal.in']
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Sat: 9:00 AM - 7:00 PM', 'Sunday: 10:00 AM - 4:00 PM']
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-neutral-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-neutral-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Get in Touch</h2>
                <p className="text-neutral-600">
                  Our team is here to help you with any questions about properties, services, or how we can assist you in finding your dream property.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-neutral-600 text-sm">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">Thank You!</h3>
                    <p className="text-neutral-600 mb-6">
                      Your message has been sent successfully. Our team will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', message: '' });
                      }}
                      className="btn-primary px-6 py-2.5 rounded-lg font-medium"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Your Message *</label>
                        <textarea
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Tell us about your requirements..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
