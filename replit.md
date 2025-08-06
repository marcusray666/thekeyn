# Loggin' Platform - Digital Art Protection & Social Network

## Overview
Loggin' is a comprehensive digital art protection platform that combines blockchain-powered copyright verification with social networking features. It enables creators to instantly protect their digital work with immutable blockchain certificates while building a community around authentic creative content. The platform's vision is to provide a robust solution for creators to secure their intellectual property in the digital age and foster a vibrant community for authentic content.

## User Preferences
Preferred communication style: Simple, everyday language.
UI animations: Disabled - user prefers static interface without motion effects.

## Recent Changes (August 2025)
- **Premium Instagram-Inspired Redesign**: Complete UI overhaul with dark charcoal (#0F0F0F) background and bold accent colors (#FE3F5E, #FFD200)
- **Instagram-Style Feed**: Implemented social feed with post cards, stories section, and floating action buttons
- **Premium Components**: Created post cards, upload modals, top/bottom navigation with glassmorphic effects
- **Dopamine-Driven UX**: Added like buttons, hover animations, premium transitions, and engaging interactions
- **Mobile-First Design**: Responsive layout with bottom navigation for mobile and top navigation for desktop
- **AI Migration**: Successfully switched from OpenAI to Google Gemini AI for content moderation
- **Content Separation Architecture**: Clear distinction between Community Posts (public social feed) and Certificates (private blockchain-protected works)
- **Share to Community Feature**: Users can share protected works to community feed with "PROTECTED" badge marking
- **AI Content Verification**: All posts display "Verified by AI" badge indicating content moderation for violence/adult content
- **Messaging System**: Full real-time messaging with persistent conversations and back navigation
- **Enhanced Navigation**: Profile dropdown includes certificates, analytics, blockchain verification, and settings
- **Consistent Gradient Backgrounds**: Applied unified pink/yellow gradient atmospheric effects across all pages
- **Animation System**: Created comprehensive animation components but disabled per user preference for static interface

## System Architecture
The application is architected for separate hosting with distinct frontend and backend applications, designed for scalability and maintainability.

### Core Technology Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, TanStack Query, Vite
- **Backend**: Node.js + Express.js, PostgreSQL + Drizzle ORM
- **Blockchain**: Ethereum mainnet integration with Ethers.js
- **Authentication**: Session-based with secure cookies
- **File Storage**: Local filesystem with blockchain anchoring
- **Animations**: Framer Motion for blockchain-inspired page transitions and micro-interactions

### Key Features and Design Decisions
- **Authentication & User Management**: Session-based authentication with secure cookie handling, role-based access control (user, admin, moderator), and tiered subscription models (Free, Starter, Pro) with upload limits. An admin system provides a comprehensive dashboard for user management.
- **Digital Work Protection**: Utilizes real blockchain verification via Ethereum mainnet anchoring. Files undergo SHA-256 hash generation for immutable fingerprinting, followed by professional PDF certificate generation with QR codes. It supports multi-format uploads (images, videos, PDFs, audio) up to 2GB.
- **Social Networking Features**: Includes post creation and sharing with rich media, a follow/unfollow system, like, comment, and share functionalities, a direct messaging system, and a notification system for user interactions.
- **Content Moderation**: Implements AI-powered content screening using keyword filtering and pattern recognition, generating automatic risk scores. An admin moderation dashboard manages a pending review queue, complemented by a user-driven content flagging system.
- **Payment & Subscriptions**: Integrates with Stripe for subscription management, enforcing tier-based upload limits and handling subscription cancellations. Usage tracking is implemented for monthly upload quotas.
- **Data Flow**: The system ensures a streamlined flow for uploads (validation → moderation → hash generation → blockchain anchoring → certificate creation → database storage) and social interactions (post creation → content screening → database storage → real-time updates → notification dispatch). Authentication follows a secure flow of credential validation → session creation → role verification → access control.

### UI/UX Decisions
The frontend follows a clean, minimalist design approach inspired by successful products like Notion and Instagram. Key design principles include:
- **Focused Screens**: Each page has one primary action to reduce cognitive load
- **Generous White Space**: Clean layouts with ample spacing for better readability
- **Minimal Navigation**: Simple header with theme toggle and essential user actions
- **Typography**: Inter font throughout for clean, modern appearance
- **Color System**: Light/dark theme support with professional color palette
- **Mobile-First**: Fully responsive design with large touch targets

### Security Measures
Security is paramount, with measures like Helmet.js for security headers, rate limiting for API protection, trust proxy configuration, and secure session cookies with proper CORS policies.

## External Dependencies

### Blockchain Services
- **Ethereum mainnet RPC** (via eth.llamarpc.com)
- **Ethers.js library** for blockchain interactions
- **OpenTimestamps** for Bitcoin anchoring (fallback)

### Payment Processing
- **Stripe API** for subscription billing and payment processing
- **Webhook handling** for subscription lifecycle events

### Development Tools (Integrated)
- **Vite** for frontend build and development
- **Drizzle ORM** for type-safe database operations
- **TanStack Query** for server state management
- **Railway** (Platform for unified fullstack deployment)
- **PostgreSQL** (via Neon or similar services for production database)