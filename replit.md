# Prooff - Digital Art Protection Platform

## Overview

Prooff is a modern web application that empowers creators to protect, register, and prove ownership of their digital artwork and creative projects. The platform provides blockchain-powered certificates of authenticity, enabling artists, designers, musicians, and other creators to instantly secure their work and defend against theft.

**Recent Updates (July 17, 2025):**
- ✅ AUTHENTICATION COMPLETELY REBUILT AND WORKING: Single-server architecture eliminates all cross-origin issues
- ✅ Backend login/register successfully creating sessions and returning user data
- ✅ Frontend using relative URLs for same-origin requests (no more CORS issues)
- ✅ Simplified API request handling with proper error handling
- ✅ Clean session management with memory store for development
- ✅ All authentication endpoints functional: login, register, logout, user verification
- ✅ Comprehensive UI: My Certificates, Certificate Detail, Report Theft, Analytics, Bulk Operations, Settings
- ✅ Beautiful liquid glass morphism design with loading animations throughout
- ✅ INCREASED FILE UPLOAD LIMITS: Now supports 500MB files for large creative works (images, audio, video)
- ✅ DOWNLOADABLE PDF CERTIFICATES: Professional certificates with QR codes, metadata, blockchain verification
- ✅ AUTOMATED DMCA TAKEDOWN SYSTEM: Professional email generation for copyright theft reporting
- ✅ COLLABORATIVE WORK SUPPORT: Multiple collaborators can be added to shared creative projects
- ✅ INTERACTIVE ONBOARDING TUTORIAL: Smooth walkthrough for new users with targeted highlights and welcome modal
- ✅ GOVERNMENT COPYRIGHT OFFICE INTEGRATION: Submit works for official registration with US, UK, Canada, and EU copyright offices

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom glass morphism design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the stack
- **File Handling**: Multer for multipart file uploads
- **Storage**: In-memory storage with interface for future database integration
- **API Design**: RESTful endpoints with JSON responses

### Data Storage Solutions
- **Current**: PostgreSQL database with Drizzle ORM (`DatabaseStorage` class)
- **Database ORM**: Drizzle ORM configured for PostgreSQL with Neon serverless
- **Schema Definition**: Shared type-safe schema definitions
- **Migration Strategy**: Drizzle Kit for database migrations
- **Session Storage**: PostgreSQL-backed session storage for authentication

## Key Components

### Core Entities
1. **Users**: Basic user management with username/password
2. **Works**: Digital creations with metadata, file information, and certificate IDs
3. **Certificates**: Blockchain-anchored proof of ownership documents

### File Processing
- **Upload Handling**: Multi-format support (images, audio, documents)
- **File Validation**: Type and size restrictions (500MB limit for large creative works)
- **Hash Generation**: SHA-256 for file integrity verification
- **Secure Storage**: Local filesystem with organized directory structure

### Certificate Generation
- **Unique IDs**: Time-based certificate identifiers with random components
- **Blockchain Integration**: Simulated blockchain hash generation (ready for real implementation)
- **Multi-format Output**: Professional PDF certificates with QR codes, comprehensive metadata, and shareable links
- **Verification System**: Public certificate lookup and validation
- **PDF Generation**: Complete work information including description, file metadata, unique numbers, blockchain hashes

### UI/UX Features
- **Glass Morphism Design**: Modern, translucent interface elements
- **Responsive Layout**: Mobile-first design with adaptive navigation
- **Interactive Components**: Drag-and-drop file uploads, real-time feedback
- **Progressive Enhancement**: Works without JavaScript for core functions

## Data Flow

### Work Registration Process
1. User uploads file through drag-and-drop interface
2. Frontend validates file type and size
3. File sent to backend with metadata (title, description, creator)
4. Backend generates file hash and unique certificate ID
5. Work record created in storage
6. Certificate generated with blockchain anchor
7. Response includes certificate details and download options

### Certificate Verification
1. Public access to certificate lookup by ID
2. File hash comparison for integrity verification
3. Blockchain hash validation (when implemented)
4. Shareable certificate display with QR codes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection (Neon database)
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **multer**: File upload handling
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Fast bundling for production

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **File Serving**: Express static file serving
- **Database**: PostgreSQL via Neon (configured but not yet connected)
- **Environment Variables**: DATABASE_URL for production database

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles Express server to `dist/index.js`
- **Asset Handling**: Static file serving from build directory
- **Process Management**: Single Node.js process serving both API and static files

### Database Integration
- **Current State**: PostgreSQL database fully integrated and operational
- **Migration Path**: Complete - successfully migrated from in-memory to PostgreSQL
- **Connection**: Neon serverless PostgreSQL active with session storage
- **Schema Updates**: `npm run db:push` for schema synchronization
- **Authentication**: Session-based authentication with database-backed storage (sessionId cookies)
- **File Upload System**: Complete with certificate generation and blockchain hashing
- **API Endpoints**: All CRUD operations functional (works, certificates, stats, auth)
- **Session Management**: Fixed session persistence with explicit session.save() calls

### Screen System Architecture
- **Comprehensive UI**: Complete screen system implementing liquid glass morphism design
- **Authentication Flow**: Login → Register → Protected screens with proper routing
- **My Certificates Page**: Grid view with search, filtering, and stats dashboard
- **Certificate Detail Page**: Full certificate display with QR codes, blockchain verification, and action buttons
- **Report Theft Page**: DMCA-compliant takedown notice generator for major platforms
- **Navigation**: Dynamic navigation with authenticated vs public routes
- **Error Handling**: Comprehensive 401/404 error states with user-friendly messages

### Scaling Considerations
- File storage can be moved to cloud storage (S3, Cloudinary)
- Blockchain integration ready for implementation
- In-memory storage easily replaceable with database implementation
- Static assets can be served via CDN