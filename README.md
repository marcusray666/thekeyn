# Loggin' - Digital Art Protection Platform

A comprehensive social media platform for creators that combines digital art protection with community networking. Empowers artists, designers, musicians, and other creators to protect their work with blockchain certificates while connecting with a global community.

## Features

### Core Platform
- **Blockchain Protection**: Real Ethereum mainnet verification for instant proof of ownership
- **Social Community**: Share, like, comment, and follow other creators
- **Portfolio Showcase**: Professional portfolio display with multiple viewing modes
- **Certificate Generation**: Professional PDF certificates with QR codes and metadata
- **Content Moderation**: AI-powered content screening with admin oversight

### Subscription Tiers
- **Free**: 3 uploads, 3 PDF certificates
- **Starter**: $9.99/month - 5 uploads, 5 certificates
- **Pro**: $19.99/month - Unlimited uploads, team features, API access

### Technical Features
- **Multi-format Support**: Images, videos, PDFs, audio files up to 2GB
- **Real-time Verification**: Immediate Ethereum blockchain anchoring
- **Mobile Ready**: Progressive Web App with native capabilities
- **Admin Dashboard**: Comprehensive platform management tools

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom glass morphism design
- **State Management**: TanStack Query for server state
- **Build Tool**: Vite for development and production

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **File Processing**: Multi-format upload handling with validation
- **Blockchain**: Ethereum integration for certificate verification

## Quick Start

### Development Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Production Deployment

#### Frontend (Static Hosting)
```bash
cd frontend/
npm install
npm run build
# Deploy dist/ folder to Vercel, Netlify, or similar
```

#### Backend (Server Hosting)
```bash
cd backend/
npm install
npm run build
npm start
# Deploy to Railway, Render, or similar
```

## Environment Variables

### Frontend
```env
VITE_API_URL=https://your-backend-api.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Backend
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
SESSION_SECRET=your-secret-key
NODE_ENV=production
```

## Documentation

- `DEPLOYMENT_GUIDE.md` - Complete hosting setup instructions
- `PROJECT_STRUCTURE.md` - Code organization overview
- `CERTIFICATE_ID_USAGE_GUIDE.md` - Certificate usage and legal information
- `ADMIN_ACCESS_INSTRUCTIONS.md` - Admin system setup

## Security Features

- CORS protection for cross-origin requests
- Rate limiting on API endpoints
- Secure session management
- File validation and sanitization
- SQL injection prevention with Drizzle ORM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For technical support or questions, please open an issue on GitHub.