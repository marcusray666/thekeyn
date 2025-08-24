# TheKeyn - Digital Art Protection & Social Network

## Overview
TheKeyn is a comprehensive digital art protection platform that combines blockchain-powered copyright verification with social networking features. It enables creators to instantly protect their digital work with immutable blockchain certificates while building a community around authentic creative content. The platform's vision is to provide a robust solution for creators to secure their intellectual property in the digital age and foster a vibrant community for authentic content.

## User Preferences
Preferred communication style: Simple, everyday language.
UI animations: Disabled - user prefers static interface without motion effects.

## System Architecture
The application is architected for separate hosting with distinct frontend and backend applications, designed for scalability and maintainability.

### Core Technology Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, TanStack Query, Vite
- **Backend**: Node.js + Express.js, PostgreSQL + Drizzle ORM
- **Blockchain**: Ethereum mainnet integration with Ethers.js
- **Authentication**: Session-based with secure cookies

### Key Features and Design Decisions
- **Authentication & User Management**: Session-based authentication, role-based access control (user, admin, moderator), and tiered subscription models with upload limits. An admin system provides a comprehensive dashboard for user management.
- **Digital Work Protection**: Utilizes real blockchain verification via Ethereum mainnet anchoring. Files undergo SHA-256 hash generation for immutable fingerprinting, followed by professional PDF certificate generation with QR codes. It supports multi-format uploads (images, videos, PDFs, audio).
- **Social Networking Features**: Includes post creation and sharing with rich media, follow/unfollow system, like, comment, and share functionalities, direct messaging system, and a notification system for user interactions. Content separation architecture distinguishes between public social feed (Community Posts) and private blockchain-protected works (Certificates). Users can share protected works to the community feed with a "PROTECTED" badge.
- **Content Moderation**: Implements AI-powered content screening using Google Gemini AI, generating automatic risk scores and displaying a "Verified by AI" badge. An admin moderation dashboard manages a pending review queue, complemented by a user-driven content flagging system.
- **Payment & Subscriptions**: Integrates with Stripe for subscription management, enforcing tier-based upload limits and handling subscription cancellations.
- **Data Flow**: The system ensures a streamlined flow for uploads (validation → moderation → hash generation → blockchain anchoring → certificate creation → database storage) and social interactions (post creation → content screening → database storage → real-time updates → notification dispatch).
- **Object Storage**: Files persist across deployments via cloud object storage with ACL controls and presigned URLs.

### UI/UX Decisions
The frontend follows a clean, minimalist design approach inspired by successful products like Notion and Instagram. Key design principles include:
- **Premium Instagram-Inspired Redesign**: Complete UI overhaul with white liquid glass theme and bold accent colors (#FE3F5E, #FFD200).
- **Complete Theme System**: Fully functional light/dark mode toggle with theme-responsive components and proper CSS variables.
- **Mobile-First Design**: Responsive layout with bottom navigation for mobile and top navigation for desktop.
- **Personalized Background System**: AI-powered background personalization engine that generates and saves gradient preferences (linear/radial, warm/cool/vibrant/pastel color schemes) with localStorage persistence and database storage.
- **Logo Redesign**: Custom LogoIcon component combining a shield shape with a thin paintbrush inside it, representing creative protection for artists.
- **Contextual Onboarding System**: Comprehensive onboarding with AI-generated illustrations, contextual tooltips, and guided tours for welcome, dashboard, upload, and studio flows.

### Security Measures
Security is paramount, with measures like Helmet.js for security headers, rate limiting for API protection, trust proxy configuration, and secure session cookies with proper CORS policies.

### Database & Migration Architecture
- **Idempotent Migration System**: Comprehensive multi-layer safety system ensuring zero data loss on Railway deployments. Features startup schema verification, custom idempotent migration scripts with PostgreSQL error code tolerance, and IF NOT EXISTS guards for all DDL operations.
- **Schema Verification**: Automated verification of 6 critical tables (users, works, certificates, posts, user_background_preferences, background_interactions) with comprehensive logging and fallback mechanisms.
- **Production Database**: 42 tables with proper foreign key constraints, background preferences system fully operational with 10 saved preferences and 29 tracked interactions. All migrations use guarded blocks to prevent duplicate operations.
- **Migration Safety**: Error codes 42P07 (duplicate_table), 42710 (duplicate_object), 42701 (duplicate_column) automatically handled. Background preferences tables integrated into Drizzle schema with full TypeScript support.

## External Dependencies

### Blockchain Services
- **Ethereum mainnet RPC** (via eth.llamarpc.com)
- **Ethers.js library** for blockchain interactions

### Payment Processing
- **Stripe API** for subscription billing and payment processing

### AI Services
- **Google Gemini AI** for content moderation

### Cloud Services
- **Replit Cloud Object Storage** for file persistence
- **PostgreSQL** (via Neon or similar services for production database)