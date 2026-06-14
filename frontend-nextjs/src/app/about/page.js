"use client";

import React from 'react';
import Link from 'next/link';
import { Target, Eye, Award, Users, Building2, CheckCircle, ArrowRight, Star, Quote, Heart, Shield, Headphones, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const stats = [
    { number: '1000+', label: 'Properties Listed' },
    { number: '5000+', label: 'Happy Buyers' },
    { number: '10+', label: 'Years Experience' },
    { number: '20+', label: 'Land Experts' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To provide a stunning, hassle-free portal and help every individual find their perfect piece of land with ease and confidence.'
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To become the most sought-after land portal in India, known for rich listings, customer satisfaction, and exceptional service.'
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'We believe in honesty, transparency, and putting our customers first. Every transaction is guided by our commitment to excellence.'
    }
  ];


  const testimonials = [
    {
      name: 'Vikram Singh',
      role: 'Agri-Entrepreneur',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      rating: 5,
      text: 'Exceptional service! The team at Nature went above and beyond to help me find the perfect agricultural land for my new organic farm. Highly recommended!'
    },
    {
      name: 'Ananya Gupta',
      role: 'Software Engineer',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating: 5,
      text: 'Found my dream hobby farm within a week. The process was incredibly smooth and the team was very supportive throughout.'
    },
    {
      name: 'Dr. Suresh Menon',
      role: 'Medical Professional',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      rating: 5,
      text: 'Professional, transparent, and efficient. Nature helped me find a beautiful riverfront acreage. Could not be happier!'
    }
  ];

  const features = [
    { icon: Shield, title: 'Premium Land', desc: 'Beautifully curated open spaces and plots' },
    { icon: Headphones, title: 'Dedicated Support', desc: 'Always here to help you navigate land deals' },
    { icon: TrendingUp, title: 'Great Value', desc: 'Competitive pricing with clear titles' },
    { icon: Award, title: 'Top Rated', desc: 'Highly reviewed by land buyers' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0c3b2e] to-[#062c22] text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <motion.img 
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920" 
            alt="Background" 
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.15] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block text-white font-black text-[10px] uppercase tracking-[0.4em] mb-6 bg-white/10 px-6 py-3 rounded-full border border-white/10">The Portal</span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">About Nature <br/> Portal<span className="text-white/60 text-italic">.</span></h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
              We define the standard of premium land search in India. Our mission is to curate the most beautiful and value-rich land parcels, farms, and acreage for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white -mt-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 border border-neutral-100">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl font-black text-[#0c3b2e] mb-2 tracking-tighter group-hover:scale-110 transition-transform">{stat.number}</div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#0c3b2e] font-bold text-sm uppercase tracking-widest">Our Story</span>
              <h2 className="text-4xl font-black text-neutral-900 mt-2 mb-8 tracking-tighter">Connecting People with Land Since 2015</h2>
              <div className="space-y-6 text-neutral-600 font-medium leading-relaxed">
                <p>
                  Nature Portal was founded with a simple yet powerful vision: to provide a transparent, professional, and aesthetic platform for purchasing rural land, farms, ranches, and green plots across India.
                </p>
                <p>
                  Over the years, we have assisted thousands of buyers in acquiring their dream properties, from lush mango orchards in Maharashtra to scenic Himalayan view plots in Himachal Pradesh.
                </p>
                <p>
                  Today, we continue to expand our portal features, offering dynamic map views and detailed land insights while preserving our core commitment to trust, title clarity, and nature preservation.
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900"
                  alt="Scenic Farm Land"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-[#0c3b2e] text-white p-8 rounded-[2rem] shadow-2xl">
                <div className="text-5xl font-black tracking-tighter">2015</div>
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-100">Year Founded</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#0c3b2e] font-bold text-sm uppercase tracking-widest">What Drives Us</span>
            <h2 className="text-4xl font-black text-neutral-900 mt-2 tracking-tighter">Mission, Vision & Values</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all border border-neutral-100">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0c3b2e] to-[#062c22] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 mb-4 tracking-tight">{value.title}</h3>
                <p className="text-neutral-500 font-medium leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-24 bg-neutral-50 text-neutral-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0c3b2e]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0c3b2e]/5 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block text-[#0c3b2e] font-black text-[10px] uppercase tracking-[0.4em] mb-4">Voice of Success</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-neutral-900">Client <span className="text-[#0c3b2e]">Testimonials.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-[2.5rem] p-10 relative border border-neutral-100 shadow-sm hover:shadow-2xl transition-all group">
                <div className="absolute -top-6 left-10 w-12 h-12 bg-gradient-to-br from-[#0c3b2e] to-[#062c22] rounded-xl flex items-center justify-center shadow-xl shadow-[#0c3b2e]/20 group-hover:scale-110 transition-transform">
                  <Quote className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex items-center mb-8 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#0c3b2e] fill-[#0c3b2e]" />
                  ))}
                </div>
                
                <p className="text-neutral-600 mb-10 font-medium leading-relaxed italic text-sm">&quot;{testimonial.text}&quot;</p>
                
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#0c3b2e]/20 group-hover:border-[#0c3b2e] transition-colors"
                  />
                  <div className="ml-4">
                    <h4 className="font-black text-neutral-900 tracking-tight">{testimonial.name}</h4>
                    <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white px-4 text-center">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-black text-neutral-900 mb-10 tracking-tighter leading-none">Ready To Find Your <br/> Open Space?</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <Link href="/properties" className="btn-primary flex items-center justify-center space-x-2 px-10 py-5 bg-[#0c3b2e] hover:bg-[#062c22] text-white rounded-xl font-bold transition-all">
                  <span>View Properties</span>
                  <ArrowRight className="w-5 h-5" />
               </Link>
               <Link href="/contact" className="btn-outline px-10 py-5 border border-slate-300 hover:border-slate-800 rounded-xl font-bold transition-all text-slate-700">
                  Contact Us
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default AboutPage;
