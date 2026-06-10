"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';
import { ArrowLeft, Plus, Trash2, X, Loader2, Search, Eye, ShieldCheck, Check, TrendingUp, Sprout, Video, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProperties = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'farming_land',
    property_subtype: 'orchard',
    price: '',
    price_type: 'sale',
    city: '',
    area: '',
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    area_sqft: '',
    images: [],
    amenities: [],
    floor_plan_url: '',
    virtual_tour_url: '',
    builder_name: 'SriSuktam Lands',
    builder_info: 'Certified organic land specialists.',
    is_featured: false,
    is_active: true,
    
    // Farming specific
    soil_type: '',
    water_source: '',
    crop_history: '',
    fencing: '',
    road_width_ft: '',
    video_url: ''
  });

  const [newImage, setNewImage] = useState('');
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    fetchProperties();
  }, [isAdmin]);

  const fetchProperties = async () => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (property = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        ...property,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area_sqft: property.area_sqft || '',
        images: property.images || [],
        amenities: property.amenities || [],
        soil_type: property.soil_type || '',
        water_source: property.water_source || '',
        crop_history: property.crop_history || '',
        fencing: property.fencing || '',
        road_width_ft: property.road_width_ft || '',
        video_url: property.video_url || ''
      });
    } else {
      setEditingProperty(null);
      setFormData({
        title: '',
        description: '',
        property_type: 'farming_land',
        property_subtype: 'orchard',
        price: '',
        price_type: 'sale',
        city: '',
        area: '',
        address: '',
        bedrooms: 0,
        bathrooms: 0,
        area_sqft: '',
        images: [],
        amenities: [],
        floor_plan_url: '',
        virtual_tour_url: '',
        builder_name: 'SriSuktam Lands',
        builder_info: 'Certified organic land specialists.',
        is_featured: false,
        is_active: true,
        soil_type: '',
        water_source: '',
        crop_history: '',
        fencing: '',
        road_width_ft: '',
        video_url: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      bedrooms: 0,
      bathrooms: 0,
      area_sqft: formData.area_sqft ? parseFloat(formData.area_sqft) : null,
      road_width_ft: formData.road_width_ft ? parseInt(formData.road_width_ft) : null
    };

    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
      if (editingProperty) {
        await axios.put(`${API_URL}/api/admin/properties/${editingProperty.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Land listing updated successfully');
      } else {
        await axios.post(`${API_URL}/api/admin/properties`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('New organic land listing created');
      }
      setShowModal(false);
      fetchProperties();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'System error during save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this farming land from the public network?')) return;
    const token = localStorage.getItem('token');
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
      await axios.delete(`${API_URL}/api/admin/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Listing permanently removed');
      fetchProperties();
    } catch (error) {
      toast.error('Authorization failed');
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] });
      setNewImage('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB');
      return;
    }

    const token = localStorage.getItem('token');
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    setUploading(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
    try {
      const response = await axios.post(`${API_URL}/api/upload/image`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const imageUrl = response.data.url;
      const fullImageUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${API_URL.replace(/\/api$/, '')}${imageUrl}`;
        
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, fullImageUrl]
      }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 50MB');
      return;
    }

    const token = localStorage.getItem('token');
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    setUploadingVideo(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '');
    try {
      const response = await axios.post(`${API_URL}/api/upload/video`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const videoUrl = response.data.url;
      const fullVideoUrl = videoUrl.startsWith('http') 
        ? videoUrl 
        : `${API_URL.replace(/\/api$/, '')}${videoUrl}`;
        
      setFormData(prev => ({
        ...prev,
        video_url: fullVideoUrl
      }));
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
      if (e.target) e.target.value = '';
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
      setNewAmenity('');
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 animate-spin text-[#0A9BA2]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <div className="bg-[#0c162c] text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A9BA2]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="w-12 h-12 bg-white/10 border border-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all group backdrop-blur-md cursor-pointer">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight font-heading">Farming <span className="text-[#0A9BA2]">Lands.</span></h1>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Portfolio Management System</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-[#0A9BA2] text-white hover:bg-[#087d83] px-10 py-4 rounded-full font-bold text-sm shadow-md transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Create Listing</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0A9BA2] transition-colors" />
            <input
              type="text"
              placeholder="Filter assets by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm focus:border-[#0A9BA2] focus:ring-4 focus:ring-[#0A9BA2]/5 outline-none transition-all font-semibold text-sm"
            />
          </div>
          <div className="flex items-center bg-white border border-slate-200/50 p-2 rounded-2xl shadow-sm">
             <div className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#0A9BA2] border-r border-slate-100">Catalog View</div>
             <div className="px-6 py-3 font-bold text-sm text-slate-800">{filteredProperties.length} Lands Online</div>
          </div>
        </div>

        {/* Properties Grid (Custom Card Style for Admin) */}
        <div className="grid gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-[#0A9BA2]/30 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                {/* Image Preview */}
                <div className="w-full lg:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                  {property.images?.[0] ? (
                    <img src={property.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sprout className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${property.is_active ? 'bg-green-600 text-white' : 'bg-slate-500 text-white'}`}>
                    {property.is_active ? 'Active' : 'Offline'}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A9BA2] bg-[#0A9BA2]/10 px-2.5 py-1 rounded-lg">{property.property_subtype}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ID: {property.id?.slice(-6)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{property.title}</h3>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1 text-[#1976D2]" /> {formatPrice(property.price)}</span>
                    <span className="flex items-center"><Sprout className="w-3.5 h-3.5 mr-1 text-[#0A9BA2]" /> {property.city}, {property.area}</span>
                    <span className="flex items-center"><Eye className="w-3.5 h-3.5 mr-1 text-slate-400" /> {property.interest_count || 0} Leads Received</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {property.is_featured && (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200" title="Featured Asset">
                       <ShieldCheck className="w-5 h-5 text-amber-600" />
                    </div>
                  )}
                  <button
                    onClick={() => openModal(property)}
                    className="flex-1 lg:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#0A9BA2] transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all group/del cursor-pointer border border-slate-200"
                  >
                    <Trash2 className="w-5 h-5 group-hover/del:scale-105 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
            <Sprout className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No assets found in inventory</p>
          </div>
        )}
      </div>

      {/* Property Modal (Full Overlay Style) */}
      <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200/50">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {editingProperty ? 'Modify Land Listing' : 'Declare New Farming Land'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Organic Inventory Management</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-all group cursor-pointer">
                <X className="w-5 h-5 text-slate-400 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Basic Section */}
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A9BA2]">Core Parameters</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        required
                        placeholder="Land Listing Title *"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#0A9BA2] outline-none transition-all"
                      />
                      <textarea
                        rows={5}
                        placeholder="Land & Soil Technical Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#0A9BA2] outline-none transition-all resize-none"
                      />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Classification</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Type</label>
                          <select
                            value={formData.property_type}
                            onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                            className="w-full px-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border border-slate-200 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                          >
                            <option value="farming_land">Farming Land</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Sub-category</label>
                          <select
                            value={formData.property_subtype}
                            onChange={(e) => setFormData({ ...formData, property_subtype: e.target.value })}
                            className="w-full px-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border border-slate-200 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                          >
                            <option value="orchard">Orchard</option>
                            <option value="plantation">Plantation</option>
                            <option value="agricultural">Agricultural Plot</option>
                            <option value="dry_land">Dry Land</option>
                            <option value="wet_land">Wet Land</option>
                          </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Valuation (INR) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#0A9BA2] outline-none transition-all"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                       <label className="flex-1 flex items-center p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 border border-slate-200 transition-colors">
                          <input type="radio" checked={formData.price_type === 'sale'} onChange={() => setFormData({...formData, price_type: 'sale'})} className="accent-[#0A9BA2]" />
                          <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-slate-700">Sale</span>
                       </label>
                       <label className="flex-1 flex items-center p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 border border-slate-200 transition-colors">
                          <input type="radio" checked={formData.price_type === 'rent'} onChange={() => setFormData({...formData, price_type: 'rent'})} className="accent-[#0A9BA2]" />
                          <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-slate-700">Lease</span>
                       </label>
                    </div>
                 </div>
              </div>

              {/* Geographic Data */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A9BA2]">Geographic Data</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="City / District *"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#0A9BA2]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Area / Taluk *"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#0A9BA2]"
                  />
                  <input
                    type="text"
                    placeholder="Survey Number / Location"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#0A9BA2]"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A9BA2]">Farming Specifications</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Area (Sq.Ft - 1 Acre = 43560)</label>
                    <input type="number" required placeholder="Area in SqFt" value={formData.area_sqft} onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-200 focus:bg-white focus:border-[#0A9BA2]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Soil Chemistry Type</label>
                    <input type="text" placeholder="Soil (e.g. Red Alluvial Clay)" value={formData.soil_type} onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-200 focus:bg-white focus:border-[#0A9BA2]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Water Source Details</label>
                    <input type="text" placeholder="Water (e.g. 2 Borewells)" value={formData.water_source} onChange={(e) => setFormData({ ...formData, water_source: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-200 focus:bg-white focus:border-[#0A9BA2]" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Crop History / Suitability</label>
                    <input type="text" placeholder="Crops (e.g. Mango, Turmeric)" value={formData.crop_history} onChange={(e) => setFormData({ ...formData, crop_history: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-200 focus:bg-white focus:border-[#0A9BA2]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Fencing Type</label>
                    <input type="text" placeholder="Fencing (e.g. Electric Fenced)" value={formData.fencing} onChange={(e) => setFormData({ ...formData, fencing: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-200 focus:bg-white focus:border-[#0A9BA2]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Road Width Access (Ft)</label>
                    <input type="number" placeholder="Road Access (e.g. 24)" value={formData.road_width_ft} onChange={(e) => setFormData({ ...formData, road_width_ft: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-200 focus:bg-white focus:border-[#0A9BA2]" />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A9BA2]">Amenities & Infrastructure</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Add an infrastructure item (e.g. Worker Shed, Solar Power)"
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#0A9BA2] outline-none transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  />
                  <button 
                    type="button" 
                    onClick={addAmenity}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#0A9BA2] transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl group hover:border-[#0A9BA2]/30 transition-all">
                        <span className="text-xs font-bold text-slate-700">{amenity}</span>
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, amenities: formData.amenities.filter((_, i) => i !== index)})}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visual Assets, Uploads and Video */}
              <div className="grid md:grid-cols-2 gap-8">
                 {/* Image Upload Area */}
                 <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A9BA2]">Images (Photos)</h3>
                    <div className="flex flex-col space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          value={newImage}
                          onChange={(e) => setNewImage(e.target.value)}
                          placeholder="Or paste Image URL"
                          className="flex-1 px-4 py-3 bg-slate-50 rounded-xl font-bold text-xs border border-slate-200"
                        />
                        <button type="button" onClick={addImage} className="px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">Add URL</button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-6 py-4 bg-[#0A9BA2]/5 border border-[#0A9BA2]/20 border-dashed rounded-2xl flex items-center justify-center space-x-3 hover:bg-[#0A9BA2]/10 transition-all font-bold text-xs uppercase tracking-wider text-[#0A9BA2] disabled:opacity-50 cursor-pointer"
                        >
                          {uploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 text-[#1976D2]" />
                              <span>Upload Image File</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative aspect-video group rounded-lg overflow-hidden border border-slate-200">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== index)})} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 {/* Video Upload Area */}
                 <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1976D2]">Video Walkthrough</h3>
                    <div className="flex flex-col space-y-3">
                      <input
                        type="text"
                        placeholder="Or paste Video URL (mp4, webm)"
                        value={formData.video_url}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                      />
                      
                      <div className="relative">
                        <input
                          type="file"
                          ref={videoFileInputRef}
                          onChange={handleVideoUpload}
                          accept="video/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploadingVideo}
                          onClick={() => videoFileInputRef.current?.click()}
                          className="w-full px-6 py-4 bg-[#1976D2]/5 border border-[#1976D2]/20 border-dashed rounded-2xl flex items-center justify-center space-x-3 hover:bg-[#1976D2]/10 transition-all font-bold text-xs uppercase tracking-wider text-[#1976D2] disabled:opacity-50 cursor-pointer"
                        >
                          {uploadingVideo ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Video className="w-4 h-4 text-[#0A9BA2]" />
                              <span>Upload Video File (Max 50MB)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {formData.video_url && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 max-w-[200px]">
                        <video src={formData.video_url} className="w-full h-full object-cover" muted />
                        <button type="button" onClick={() => setFormData({...formData, video_url: ''})} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                 </div>
              </div>

              {/* Status Controls */}
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Status</h3>
                    <div className="space-y-4">
                       <label className="flex items-center justify-between p-6 bg-amber-50 rounded-3xl cursor-pointer group border border-amber-100">
                          <div className="flex items-center space-x-4">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm"><TrendingUp className="w-5 h-5" /></div>
                             <span className="text-xs font-bold uppercase tracking-widest text-amber-900">Feature in Spotlight</span>
                          </div>
                          <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-6 h-6 accent-amber-600 cursor-pointer" />
                       </label>
                       
                       <label className="flex items-center justify-between p-6 bg-slate-100/50 rounded-3xl cursor-pointer group border border-slate-200/40">
                          <div className="flex items-center space-x-4">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><ShieldCheck className="w-5 h-5" /></div>
                             <span className="text-xs font-bold uppercase tracking-widest text-slate-800">Active Listing</span>
                          </div>
                          <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-6 h-6 accent-[#0A9BA2] cursor-pointer" />
                       </label>
                    </div>
                 </div>
              </div>

              {/* Submit Final */}
              <div className="flex justify-end pt-10">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-12 py-5 bg-[#0A9BA2] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0A9BA2]/10 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>{editingProperty ? 'Sync Configuration' : 'Initialize Asset'}</span>
                      <ShieldCheck className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProperties;
