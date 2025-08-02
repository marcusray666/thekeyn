# Loggin' Platform - Digital Art Protection & Social Network

## Overview
Loggin' is a comprehensive digital art protection platform that combines blockchain-powered copyright verification with social networking features. It enables creators to instantly protect their digital work with immutable blockchain certificates while building a community around authentic creative content. The platform's vision is to provide a robust solution for creators to secure their intellectual property in the digital age and foster a vibrant community for authentic content.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application is architected for separate hosting with distinct frontend and backend applications, designed for scalability and maintainability.

### Core Technology Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, TanStack Query, Vite
- **Backend**: Node.js + Express.js, PostgreSQL + Drizzle ORM
- **Blockchain**: Ethereum mainnet integration with Ethers.js
- **Authentication**: Session-based with secure cookies
- **File Storage**: Local filesystem with blockchain anchoring

### Key Features and Design Decisions
- **Authentication & User Management**: Session-based authentication with secure cookie handling, role-based access control (user, admin, moderator), and tiered subscription models (Free, Starter, Pro) with upload limits. An admin system provides a comprehensive dashboard for user management.
- **Digital Work Protection**: Utilizes real blockchain verification via Ethereum mainnet anchoring. Files undergo SHA-256 hash generation for immutable fingerprinting, followed by professional PDF certificate generation with QR codes. It supports multi-format uploads (images, videos, PDFs, audio) up to 2GB.
- **Social Networking Features**: Includes post creation and sharing with rich media, a follow/unfollow system, like, comment, and share functionalities, a direct messaging system, and a notification system for user interactions.
- **Content Moderation**: Implements AI-powered content screening using keyword filtering and pattern recognition, generating automatic risk scores. An admin moderation dashboard manages a pending review queue, complemented by a user-driven content flagging system.
- **Payment & Subscriptions**: Integrates with Stripe for subscription management, enforcing tier-based upload limits and handling subscription cancellations. Usage tracking is implemented for monthly upload quotas.
- **Data Flow**: The system ensures a streamlined flow for uploads (validation → moderation → hash generation → blockchain anchoring → certificate creation → database storage) and social interactions (post creation → content screening → database storage → real-time updates → notification dispatch). Authentication follows a secure flow of credential validation → session creation → role verification → access control.

### UI/UX Decisions
The frontend leverages Tailwind CSS for a utility-first approach to styling, ensuring a consistent and responsive design across the platform. Conditional navigation is implemented to provide different experiences for authenticated and unauthenticated users, streamlining the user journey.

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