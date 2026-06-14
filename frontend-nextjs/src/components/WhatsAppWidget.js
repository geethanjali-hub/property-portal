"use client";
import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppWidget = () => {
  return (
    <a
      href="https://wa.me/919740383725"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute right-full mr-4 bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-neutral-100 pointer-events-none">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppWidget;
