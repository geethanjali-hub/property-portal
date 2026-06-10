# Make My Propertyz - Product Requirements Document

## Project Overview
**Brand**: Make My Propertyz  
**Tagline**: "Where Dream Meets Destiny"  
**Type**: Real Estate Property Portal  
**Logo Colors**: Primary Red (#D01F3C), White (#FFFFFF), Black (#000000)

## User Personas

### 1. Property Seeker
- Looking for residential or commercial properties
- Wants to browse, filter, and express interest
- May or may not want to create an account
- Key feature: Can submit interest WITHOUT logging in

### 2. Admin/Property Manager
- Manages property listings
- Views and manages leads (interests and contacts)
- Needs comprehensive dashboard with analytics

## Core Requirements

### Property Features
- Property listings with filters (type, subtype, city, bedrooms, price)
- Property types: Residential (Apartment, Villa, House, Plot), Commercial (Office, Shop, Warehouse)
- Property details: Title, Description, Price, Location, Bedrooms, Bathrooms, Area, Images
- Additional info: Amenities, Floor Plan URL, Virtual Tour URL, Builder Info
- Featured properties section

### User Features
- User registration and authentication (JWT-based)
- **Interest submission WITHOUT login** (Name, Email, Phone)
- Contact form submission
- Property browsing and search

### Admin Features
- Admin dashboard with stats (Properties, Interests, Contacts)
- Full CRUD for Properties with image URLs
- View all interest submissions (leads)
- View and manage contact messages
- Mark contacts as read/unread

### Content Features
- About Us page with company story
- Contact Us page with form and map
- Professional design matching brand colors

## What's Been Implemented ✅

### Backend (FastAPI + MongoDB)
- [x] User authentication (register, login, JWT tokens)
- [x] Properties CRUD API with filtering
- [x] **Interest submission API (NO AUTH REQUIRED)**
- [x] Contact form API (NO AUTH REQUIRED)
- [x] Admin stats API
- [x] Admin interests/leads API
- [x] Admin contacts API
- [x] Image upload API
- [x] Seed data endpoint

### Frontend (React + Tailwind CSS)
- [x] Responsive header with Make My Propertyz logo
- [x] Homepage with hero, search, stats, property types, featured properties, CTA
- [x] Properties listing page with filters
- [x] Property detail page with full info
- [x] **"I'm Interested" button with modal form (NO LOGIN REQUIRED)**
- [x] About Us page with company info
- [x] Contact Us page with form and map
- [x] User authentication modal
- [x] Admin Dashboard with stats
- [x] Admin Properties management
- [x] Admin Interests (leads) view
- [x] Admin Contacts management

### Design
- [x] Primary Red (#D01F3C) color theme
- [x] Clean, professional UI
- [x] Mobile-responsive design
- [x] Make My Propertyz logo integration

## Database Schema (MongoDB)

### Collections
- users (id, email, name, phone, password, role, created_at)
- properties (id, title, description, property_type, property_subtype, price, price_type, city, area, address, bedrooms, bathrooms, area_sqft, images, amenities, floor_plan_url, virtual_tour_url, builder_name, builder_info, is_featured, is_active, interest_count, created_at)
- interests (id, property_id, property_title, name, email, phone, created_at)
- contacts (id, name, email, phone, message, is_read, created_at)

## Admin Credentials
- Email: admin@makemypropertyz.com
- Password: admin123

## Technical Stack
- Frontend: React 19, Tailwind CSS, Lucide Icons
- Backend: FastAPI (Python)
- Database: MongoDB
- Authentication: JWT

## Key Feature: Interest Without Login
The most important feature is that users can express interest in properties WITHOUT creating an account or logging in. The interest form captures:
- Name
- Email
- Phone Number

This data is stored in the database and visible in the admin panel.

## Last Updated
Date: July 2025
