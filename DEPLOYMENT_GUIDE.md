# 🚀 Loggin' Deployment Guide

Complete guide to deploy the Loggin' platform with separated frontend and backend hosting.

## 📁 Project Structure

Your project is now organized for separate deployments:

```
loggin-platform/
├── frontend/          # React frontend application
│   ├── src/          # Frontend source code
│   ├── package.json  # Frontend dependencies
│   └── README.md     # Frontend deployment guide
├── backend/          # Express.js backend API
│   ├── src/          # Backend source code
│   ├── shared/       # Shared types and schemas
│   ├── package.json  # Backend dependencies
│   └── README.md     # Backend deployment guide
└── DEPLOYMENT_GUIDE.md # This file
```

## 🎯 Deployment Strategy

### Frontend Hosting Options
- **Vercel** (Recommended) - Zero-config deployment
- **Netlify** - Great for static sites
- **Cloudflare Pages** - Fast global CDN
- **GitHub Pages** - Free for public repos

### Backend Hosting Options
- **Railway** (Recommended) - Simple Node.js hosting
- **Render** - Free tier available
- **Heroku** - Classic PaaS platform
- **DigitalOcean App Platform** - Scalable hosting

## 🔄 Step-by-Step Deployment

### 1. Backend Deployment First

**Deploy to Railway (Recommended):**
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Add environment variables:
   ```
   DATABASE_URL=your_postgresql_url
   SESSION_SECRET=your_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret
   OPENAI_API_KEY=your_openai_key
   NODE_ENV=production
   ```
5. Railway automatically builds and deploys
6. Note your backend URL (e.g., `https://your-app.railway.app`)

### 2. Frontend Deployment Second

**Deploy to Vercel (Recommended):**
1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Select the `frontend` folder as root directory
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```
5. Deploy automatically

### 3. Update Backend CORS

After frontend deployment, update your backend environment variables:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🔧 Local Development Setup

### Backend (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

## 🛡️ Environment Variables Checklist

### Backend Required
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Random secret key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `FRONTEND_URL` - Your frontend domain

### Frontend Required
- [ ] `VITE_API_URL` - Your backend domain
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## 🔍 Troubleshooting

### CORS Issues
If you get CORS errors:
1. Check `FRONTEND_URL` in backend environment
2. Ensure frontend is using correct `VITE_API_URL`
3. Check browser network tab for blocked requests

### Database Connection Issues
1. Verify `DATABASE_URL` format
2. Run `npm run db:push` after first deployment
3. Check database permissions

### Build Failures
1. Check Node.js version compatibility
2. Verify all environment variables are set
3. Check build logs for specific errors

## 📊 Monitoring & Maintenance

### Backend Monitoring
- Check server logs in hosting dashboard
- Monitor API response times
- Set up health check endpoints

### Frontend Monitoring
- Monitor build status
- Check for JavaScript errors
- Monitor page load times

## 🔄 Continuous Deployment

Both platforms support automatic deployment:
- **Push to main branch** → Automatic deployment
- **Pull request previews** → Test before merging
- **Environment-specific branches** → Staging deployments

## 💡 Pro Tips

1. **Environment Management**: Use different environment variables for staging and production
2. **Database Backups**: Set up automatic backups for your PostgreSQL database
3. **CDN Configuration**: Enable CDN for faster global access
4. **SSL Certificates**: Both platforms provide free HTTPS automatically
5. **Custom Domains**: Configure custom domains in hosting dashboards

## 🆘 Support

If you encounter issues:
1. Check the individual README files in `frontend/` and `backend/`
2. Review hosting platform documentation
3. Check environment variable configurations
4. Monitor application logs for specific error messages

Your Loggin' platform is now ready for professional deployment with separated, scalable architecture! 🎉