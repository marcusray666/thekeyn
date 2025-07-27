# Loggin' Frontend

React frontend for the Loggin' digital art protection platform.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### Production Build
```bash
npm run build
```

## 🔧 Environment Variables

Create a `.env` file in the frontend directory with:

```env
VITE_API_URL=https://your-backend-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

## 📦 Deployment

### Vercel
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in dashboard

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in site settings

### Other Static Hosts
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Environment variables**: Set `VITE_API_URL` to your backend URL

## 🔗 Backend Connection

The frontend connects to your backend API using the `VITE_API_URL` environment variable. Make sure this points to your deployed backend server.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and config
│   └── utils/         # Helper functions
├── public/            # Static assets
└── dist/              # Build output
```

## 🛠 Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **TanStack Query** - Data fetching
- **Wouter** - Routing