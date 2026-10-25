import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database/mongodb';
import { startCleanupUnpaidOrdersCron } from './cron/cleanupUnpaidOrders';
import { UPLOAD_DIR } from './config/s3.config';
import authRoutes from './routes/auth.routes';
import printRoutes from './routes/print.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import supportRoutes from './routes/support.routes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Trust reverse proxy (Nginx on VPS) so req.protocol and req.ip are accurate
app.set('trust proxy', 1);

// Middleware: allow configured origins or reflect origin for VPS deployment flexibility
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: allowedOrigins ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files locally (accessible both directly and behind /api proxy)
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/print', printRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/support', supportRoutes);

// Health check (both /health and /api/health for Nginx proxy compatibility)
app.get(['/health', '/api/health'], (_, res) => {
  res.json({ status: 'OK', storage: 'local', timestamp: new Date().toISOString() });
});

// Serve Admin Frontend at /admin
const adminDistCandidates = [
  path.resolve(__dirname, '../../Admin Frontend/dist'),
  path.resolve(__dirname, '../../admin/dist'),
];
const adminDistPath = adminDistCandidates.find((p) => fs.existsSync(p));
if (adminDistPath) {
  app.use('/admin', express.static(adminDistPath));
  app.get(['/admin', '/admin/*'], (_req, res) => {
    res.sendFile(path.join(adminDistPath, 'index.html'));
  });
}

// Serve Student Frontend at /
const frontendDistCandidates = [
  path.resolve(__dirname, '../../Frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
];
const frontendDistPath = frontendDistCandidates.find((p) => fs.existsSync(p));
if (frontendDistPath) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/admin')) {
      next();
      return;
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Initialize MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectDB();
    if (!connected) {
      console.warn('⚠️  MongoDB connection failed, but server will start anyway');
    }

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`🌐 Student App: http://0.0.0.0:${PORT}/`);
      console.log(`🛠️  Admin Panel: http://0.0.0.0:${PORT}/admin/`);
      console.log(`📊 Health check: /api/health`);
      console.log(`🔐 Auth API: /api/auth`);
      console.log(`🖨️  Print API: /api/print\n`);
      
      // Start cron jobs
      startCleanupUnpaidOrdersCron();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// setInterval(async () => {
//     try {
//         await fetch('https://printit-4335.onrender.com/health');
//         const uptimeSeconds = process.uptime();
//         const uptimeMinutes = Math.floor(uptimeSeconds / 60);
//         const uptimeHours = Math.floor(uptimeMinutes / 60);
//         const uptimeDays = Math.floor(uptimeHours / 24);

//         console.log(`[Ping] Server uptime: ${uptimeDays} days, ${uptimeHours % 24} hours, ${uptimeMinutes % 60} minutes`);
//     } catch (err: any) {
//         console.error('[Ping Error]', err.message);
//     }
// }, 10 * 60 * 1000); // 10 minutes

startServer();

export default app;
