# Loggin' Backend

Express.js backend API for the Loggin' digital art protection platform.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

Backend will run on `http://localhost:5000`

### Production Build & Start
```bash
npm run build
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory with:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
SESSION_SECRET=your-super-secret-session-key

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# OpenAI (for content moderation)
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Database Connection (for reference)
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-postgres-user
PGPASSWORD=your-postgres-password
PGDATABASE=your-postgres-database
```

## 📦 Deployment

### Railway
1. Connect your GitHub repository
2. Add environment variables
3. Railway auto-deploys on push

### Render
1. Create new Web Service
2. Connect GitHub repository
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

### Heroku
1. Create new app
2. Connect GitHub repository
3. Add environment variables
4. Enable automatic deploys

### DigitalOcean App Platform
1. Create new app from GitHub
2. Set build command: `npm run build`
3. Set run command: `npm start`
4. Add environment variables

## 🗄️ Database Setup

The app uses PostgreSQL with Drizzle ORM. After setting up your database:

```bash
npm run db:push
```

This will create all necessary tables and schemas.

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic services
│   ├── db.ts          # Database connection
│   ├── storage.ts     # Data access layer
│   └── index.ts       # Server entry point
├── shared/            # Shared types and schemas
├── uploads/           # File upload storage
└── migrations/        # Database migrations
```

## 🛠 Technologies

- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Database toolkit
- **TypeScript** - Type safety
- **Passport.js** - Authentication
- **Stripe** - Payment processing
- **OpenAI** - Content moderation
- **Multer** - File uploads

## 🔒 Security Features

- **Rate limiting** - Prevents abuse
- **CORS protection** - Cross-origin security
- **Helmet** - Security headers
- **Session management** - Secure authentication
- **Input validation** - Zod schema validation
- **Content moderation** - AI-powered screening

## 🔗 Frontend Connection

Make sure to set your `FRONTEND_URL` environment variable to allow CORS requests from your deployed frontend.