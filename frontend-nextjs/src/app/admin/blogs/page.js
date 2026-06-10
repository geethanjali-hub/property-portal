"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';
import { ArrowLeft, Plus, Edit2, Trash2, X, Loader2, Search, BookOpen, Eye, Check, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBlogs = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image_url: '',
    author_name: 'Admin',
    is_published: true
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchBlogs();
    }
  }, [isAdmin]);

  const fetchBlogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/blogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        image_url: blog.image_url || '',
        author_name: blog.author_name || 'Admin',
        is_published: blog.is_published !== undefined ? blog.is_published : true
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image_url: '',
        author_name: 'Admin',
        is_published: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBlog(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      toast.loading('Uploading image...', { id: 'upload' });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setFormData(prev => ({ ...prev, image_url: response.data.url }));
      toast.success('Image uploaded', { id: 'upload' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', { id: 'upload' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      if (editingBlog) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/${editingBlog.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Blog updated successfully');
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Blog created successfully');
      }
      fetchBlogs();
      closeModal();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(error.response?.data?.detail || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    blog.author_name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <Loader2 className="w-12 h-12 animate-spin text-[#D01F3C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-poppins text-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="flex items-center text-gray-500 hover:text-[#D01F3C] mb-2 transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Blog <span className="text-[#D01F3C]">Management</span></h1>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center bg-[#D01F3C] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#B01A33] transition-all shadow-lg active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blogs by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D01F3C]/20 transition-all text-sm"
            />
          </div>
        </div>

        {/* Blog Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Post</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Author</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Date</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 mr-4 flex-shrink-0 border border-gray-200">
                          {blog.image_url ? (
                            <img src={blog.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1">{blog.title}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">{blog.excerpt || 'No excerpt provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-semibold text-gray-600">{blog.author_name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        blog.is_published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {blog.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-gray-400">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/blogs/${blog.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-[#D01F3C] transition-colors bg-gray-50 rounded-xl"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openModal(blog)}
                          className="p-2 text-gray-400 hover:text-[#D01F3C] transition-colors bg-gray-50 rounded-xl"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBlog(blog.id)}
                          className="p-2 text-gray-400 hover:text-[#D01F3C] transition-colors bg-gray-50 rounded-xl"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBlogs.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">No blog posts found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Blog Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                <h2 className="text-2xl font-black text-neutral-900">
                  {editingBlog ? 'Edit' : 'Create'} Blog <span className="text-[#D01F3C]">Post</span>
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form id="blogForm" onSubmit={handleSubmit} className="space-y-8">
                  {/* Image Upload Area */}
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Featured Image</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div 
                        className="relative group aspect-video rounded-3xl bg-neutral-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#D01F3C]/50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('imageInput').click()}
                      >
                        {formData.image_url ? (
                          <>
                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Click to Upload</p>
                          </div>
                        )}
                        <input
                          id="imageInput"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-4">
                        <div>
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Direct Image URL</label>
                          <input
                            type="text"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D01F3C]/20 transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Post Title</label>
                      <input
                        required
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Expert tips for first-time buyers..."
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D01F3C]/20 transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Author</label>
                      <input
                        required
                        type="text"
                        name="author_name"
                        value={formData.author_name}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D01F3C]/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Short Excerpt</label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="A brief summary of the post..."
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D01F3C]/20 transition-all text-sm resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Content (Markdown Supported)</label>
                    <textarea
                      required
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows="10"
                      placeholder="Write your blog post content here..."
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D01F3C]/20 transition-all text-sm font-medium leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="flex items-center space-x-3 bg-gray-50 p-6 rounded-2xl">
                    <input
                      type="checkbox"
                      id="is_published"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#D01F3C] focus:ring-[#D01F3C]/20"
                    />
                    <label htmlFor="is_published" className="text-sm font-bold text-neutral-700">Publish this post immediately</label>
                  </div>
                </form>
              </div>

              <div className="p-8 pt-4 flex flex-col sm:flex-row gap-4 bg-white relative z-10">
                <button
                  type="submit"
                  form="blogForm"
                  disabled={saving}
                  className="flex-1 bg-[#D01F3C] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#B01A33] transition-all flex items-center justify-center shadow-xl disabled:opacity-50 active:scale-95"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {editingBlog ? 'Update Post' : 'Publish Post'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBlogs;
