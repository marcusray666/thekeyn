import type { Express } from "express";
import { createServer } from "http";

export async function registerRoutes(app: Express) {
  // Create HTTP server
  const server = createServer(app);

  // Basic health check route
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Basic auth check route
  app.get('/api/auth/me', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (userId) {
      res.json({ authenticated: true, userId });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Basic login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      // Simple mock authentication for now
      const { username, password } = req.body;
      
      if (username === 'vladislavdonighevici111307' && password === 'admin') {
        (req.session as any).userId = 1;
        res.json({ success: true, user: { id: 1, username, role: 'admin' } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Basic logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to logout' });
      } else {
        res.json({ success: true });
      }
    });
  });

  // Catch-all for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.path}` });
  });

  return server;
}