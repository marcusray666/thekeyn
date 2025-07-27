# Loggin' Backend

Express.js backend API for the Loggin' digital art protection platform.

## 🚀 Quick Start

### Development
```bash
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🌐 Deployment

### Render.com (Recommended)
1. Connect your GitHub repository
2. Select the `backend` directory
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables listed in `.env.example`

### Railway
1. Connect your GitHub repository 
2. Select the `backend` directory
3. Add environment variables
4. Deploy automatically

## 🔧 Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-random-secret-key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
OPENAI_API_KEY=sk-your-openai-key
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## 📊 Database Setup

After deployment, run database migrations:
```bash
npm run db:push
```

## 🔗 API Endpoints

- **Authentication**: `/api/auth/*`
- **User Management**: `/api/users/*`
- **File Upload**: `/api/works/*`
- **Blockchain Verification**: `/api/verification/*`
- **Social Features**: `/api/social/*`
- **Subscriptions**: `/api/subscription/*`
- **Admin**: `/api/admin/*`

## 🛡️ Security Features

- Rate limiting on all endpoints
- Helmet.js security headers
- CORS configuration
- Session-based authentication
- File upload validation
- Content moderation