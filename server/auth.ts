import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { createHash } from 'crypto';

// Hard-coded admin credentials (for simplicity) - in a real app, use a database
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = createHash('sha256').update('password123').digest('hex');

declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
    username?: string;
  }
}

export const setupAuth = (app: any) => {
  // Configure session middleware
  app.use(session({
    secret: 'your-secret-key', // Change this to a real secret key in production
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    // Using memory store for sessions (already the default)
    // In production, you would use a persistent store
  }));

  // Login route
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    // Hash the input password
    const passwordHash = createHash('sha256').update(password).digest('hex');
    
    // Check credentials
    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
      req.session.isAuthenticated = true;
      req.session.username = username;
      return res.json({ success: true });
    }
    
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  });

  // Logout route
  app.post('/api/admin/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true });
    });
  });

  // Check authentication status
  app.get('/api/admin/status', (req: Request, res: Response) => {
    if (req.session.isAuthenticated) {
      return res.json({ isAuthenticated: true, username: req.session.username });
    }
    return res.json({ isAuthenticated: false });
  });
};

// Middleware to protect routes
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};