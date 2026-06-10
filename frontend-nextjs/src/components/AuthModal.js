"use client";

import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  
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
        await login(formData.email, formData.password);
        toast.success('Successfully logged in!');
      } else {
        await signup(formData);
        toast.success('Account created successfully!');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
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
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px] border border-slate-100"
        >
          {/* Left Side: Brand Visual */}
          <div className="hidden md:flex md:w-5/12 bg-[#0c162c] relative p-12 flex-col justify-between text-white overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A9BA2]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1976D2]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-8">
                   <ShieldCheck className="w-6 h-6 text-[#0A9BA2]" />
                </div>
                <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-6">Experience <br/> The Premium <br/> Standard.</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Join Bangalore's most exclusive property network today.</p>
             </div>

             <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#0A9BA2]">Trusted by 10,000+ Investors</p>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 p-8 md:p-14 bg-white relative flex flex-col justify-center">
            <button
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-w-md mx-auto w-full">
              <div className="mb-10">
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-slate-500 font-semibold text-sm">
                  {isLogin ? 'Enter your credentials to access your portal.' : 'Sign up to start your property journey.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A9BA2] transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold tracking-tight focus:bg-white focus:border-[#0A9BA2] outline-none transition-all placeholder:text-slate-400"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                )}
                
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A9BA2] transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold tracking-tight focus:bg-white focus:border-[#0A9BA2] outline-none transition-all placeholder:text-slate-400"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {!isLogin && (
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A9BA2] transition-colors" />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold tracking-tight focus:bg-white focus:border-[#0A9BA2] outline-none transition-all placeholder:text-slate-400"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                )}

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A9BA2] transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="Security Password"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold tracking-tight focus:bg-white focus:border-[#0A9BA2] outline-none transition-all placeholder:text-slate-400"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                {isLogin && (
                   <div className="text-right">
                     <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-[#0A9BA2] hover:opacity-85 transition-opacity">Forgot Key?</button>
                   </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0A9BA2] text-white py-4 rounded-xl font-bold text-sm shadow-md hover:bg-[#087d83] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
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

              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-400 text-xs font-bold transition-all hover:text-slate-700"
                >
                  {isLogin ? (
                    <span>Don't have an account? <span className="text-[#0A9BA2] font-bold uppercase tracking-wider ml-1">Join Group</span></span>
                  ) : (
                    <span>Already a member? <span className="text-[#0A9BA2] font-bold uppercase tracking-wider ml-1">Sign In</span></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
