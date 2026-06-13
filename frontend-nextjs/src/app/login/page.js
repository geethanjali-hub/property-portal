"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, User, Lock, Mail, Phone, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

const LoginContent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        toast.success('Successfully logged in!');
      } else {
        await signup(formData);
        toast.success('Account created successfully!');
      }
      router.push(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]"
      >
        {/* Left Side: Brand Visual */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#D01F3C] to-[#B01A33] relative p-12 flex-col justify-between text-white overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
           
           <div className="relative z-10">
             <Link href="/" className="inline-block mb-12">
                <img src="/mmp_logo.png" alt="MMP" className="h-20 w-auto brightness-200" />
             </Link>
             <div className="bg-white/20 backdrop-blur-md border border-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-8">
                <ShieldCheck className="w-6 h-6 text-white" />
             </div>
             <h2 className="text-4xl font-black leading-tight tracking-tighter mb-6">Experience <br/> The Premium <br/> Standard.</h2>
             <p className="text-white/80 text-sm font-medium leading-relaxed">Join Bangalore&apos;s most exclusive property network today.</p>
           </div>

           <div className="relative z-10">
             <div className="flex -space-x-3 mb-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-[8px] font-bold text-white">MMP</div>
                ))}
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Trusted by 10,000+ Investors</p>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-14 bg-white relative">
          <Link href="/" className="absolute top-8 right-8 text-neutral-400 hover:text-neutral-900 transition-colors">
            <X className="w-6 h-6" />
          </Link>

          <div className="max-w-md mx-auto h-full flex flex-col justify-center">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-neutral-900 tracking-tighter mb-2 font-heading">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-neutral-500 font-medium text-sm">
                {isLogin ? 'Enter your credentials to access your portal.' : 'Sign up to start your property journey.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#D01F3C] transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold tracking-tight focus:bg-white focus:border-[#D01F3C]/30 focus:ring-4 focus:ring-[#D01F3C]/5 outline-none transition-all placeholder:text-neutral-300"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}
              
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#D01F3C] transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold tracking-tight focus:bg-white focus:border-[#D01F3C]/30 focus:ring-4 focus:ring-[#D01F3C]/5 outline-none transition-all placeholder:text-neutral-300"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {!isLogin && (
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#D01F3C] transition-colors" />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold tracking-tight focus:bg-white focus:border-[#D01F3C]/30 focus:ring-4 focus:ring-[#D01F3C]/5 outline-none transition-all placeholder:text-neutral-300"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              )}

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#D01F3C] transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Security Password"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold tracking-tight focus:bg-white focus:border-[#D01F3C]/30 focus:ring-4 focus:ring-[#D01F3C]/5 outline-none transition-all placeholder:text-neutral-300"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {isLogin && (
                 <div className="text-right">
                   <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#D01F3C] hover:opacity-80 transition-opacity">Forgot Key?</button>
                 </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D01F3C] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#D01F3C]/20 hover:bg-[#B01A33] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Unlock Portal' : 'Register Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-neutral-400 text-xs font-bold transition-all hover:text-neutral-900"
              >
                {isLogin ? (
                  <span>Don&apos;t have an account? <span className="text-[#D01F3C] font-black uppercase tracking-widest ml-1">Join Group</span></span>
                ) : (
                  <span>Already a member? <span className="text-[#D01F3C] font-black uppercase tracking-widest ml-1">Sign In</span></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#D01F3C]" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
