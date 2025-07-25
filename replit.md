# Loggin' Platform - Digital Art Protection & Social Network

## Overview

Loggin' is a comprehensive digital art protection platform that combines blockchain-powered copyright verification with social networking features. The platform enables creators to instantly protect their digital work with immutable blockchain certificates while building a community around authentic creative content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend/Backend Separation
The application is architected for separate hosting with distinct frontend and backend applications:
- **Frontend**: React-based client application deployable to static hosting (Vercel, Netlify)
- **Backend**: Express.js API server deployable to platforms like Railway or Render
- **CORS Configuration**: Proper cross-origin setup for separate domain hosting

### Core Technology Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, TanStack Query, Vite
- **Backend**: Node.js + Express.js, PostgreSQL + Drizzle ORM
- **Blockchain**: Ethereum mainnet integration with Ethers.js
- **Authentication**: Session-based with secure cookies
- **File Storage**: Local filesystem with blockchain anchoring

## Key Components

### 1. Authentication & User Management
- **Session-based authentication** with secure cookie handling
- **Role-based access control** (user, admin, moderator)
- **Subscription tiers** (Free: 3 uploads, Starter: 5 uploads, Pro: unlimited)
- **Admin system** with comprehensive dashboard and user management

### 2. Digital Work Protection
- **Real blockchain verification** using Ethereum mainnet anchoring
- **File hash generation** with SHA-256 for immutable fingerprinting
- **Certificate generation** with professional PDF output and QR codes
- **Multi-format support** for images, videos, PDFs, audio (up to 2GB)

### 3. Social Networking Features
- **Post creation and sharing** with rich media support
- **Follow/unfollow system** with real-time follower counts
- **Like, comment, and share** functionality
- **Direct messaging** system with conversation management
- **Notification system** for user interactions

### 4. Content Moderation
- **AI-powered content screening** using free keyword filtering and pattern recognition
- **Automatic risk scoring** with confidence ratings
- **Admin moderation dashboard** with pending review queue
- **Content flagging system** for inappropriate material

### 5. Payment & Subscriptions
- **Stripe integration** for subscription management
- **Tier-based upload limits** with automatic enforcement
- **Subscription cancellation** with graceful period handling
- **Usage tracking** for monthly upload quotas

## Data Flow

### Upload Process
1. **File validation** → **Content moderation** → **Hash generation** → **Blockchain anchoring** → **Certificate creation** → **Database storage**

### Social Interactions
1. **Post creation** → **Content screening** → **Database storage** → **Real-time updates** → **Notification dispatch**

### Authentication Flow
1. **Login request** → **Credential validation** → **Session creation** → **Role verification** → **Access control**

## External Dependencies

### Blockchain Services
- **Ethereum mainnet RPC** (via eth.llamarpc.com)
- **Ethers.js library** for blockchain interactions
- **OpenTimestamps** for Bitcoin anchoring (fallback)

### Payment Processing
- **Stripe API** for subscription billing and payment processing
- **Webhook handling** for subscription lifecycle events

### Development Tools
- **Vite** for frontend build and development
- **Drizzle ORM** for type-safe database operations
- **TanStack Query** for server state management

## Deployment Strategy

### Production Architecture
- **Frontend hosting**: Static site deployment (Vercel recommended)
- **Backend hosting**: Node.js platform (Railway recommended)
- **Database**: PostgreSQL (Neon or similar)
- **Environment separation**: Distinct configurations for frontend (VITE_*) and backend

### Security Measures
- **Helmet.js** for security headers
- **Rate limiting** for API protection
- **Trust proxy** configuration for production
- **Secure session cookies** with proper CORS policies

### Development Setup
- **Unified development** environment with proxy configuration
- **Hot module replacement** via Vite
- **Type safety** throughout with shared schema definitions
- **Local file uploads** directory for development

The platform is designed as a production-ready application with proper separation of concerns, comprehensive security measures, and scalable architecture supporting both individual creators and enterprise use cases.

## Recent Changes - July 25, 2025

### Backend Deployment Successfully Completed
- ✅ Fixed JSON syntax error in backend/package.json (removed duplicate dependencies)
- ✅ Resolved all import path issues (@shared/schema → relative paths)  
- ✅ Updated Render configuration (Root Directory: backend, simplified build process)
- ✅ Backend now starts successfully on Render with tsx execution
- ✅ Database configured with Render PostgreSQL
- ✅ Environment variables properly configured (DATABASE_URL, STRIPE_SECRET_KEY)
- ✅ Stripe integration made optional with development placeholders
- ✅ Backend fully operational and ready for production traffic

### Deployment Status
- **Frontend**: 🔄 Vercel deployment configured with correct build settings (vercel.json created)
- **Backend**: ✅ Successfully deployed to Render at https://loggin-64qr.onrender.com
- **Database**: ✅ PostgreSQL configured with Render database
- **Environment**: ✅ All required variables configured (DATABASE_URL, STRIPE_SECRET_KEY)
- **Status**: Backend operational, Vercel stuck on old commit - needs direct GitHub vercel.json upload

### Deployment Issues Fixed
- ✅ Fixed JSON syntax error in backend/package.json (removed duplicate dependencies)
- ✅ Resolved all import path issues (@shared/schema → relative paths)  
- ✅ Updated Render configuration (Root Directory: backend, simplified build process)
- ✅ Backend now starts successfully on Render with tsx execution
- ✅ Database configured with Render PostgreSQL
- ✅ Environment variables properly configured (DATABASE_URL, STRIPE_SECRET_KEY)
- ✅ Stripe integration made optional with development placeholders
- ✅ Backend fully operational and ready for production traffic