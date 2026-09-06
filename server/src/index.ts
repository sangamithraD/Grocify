import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import itemsRoutes from './routes/items';

import fs from 'fs';
import path from 'path';
import pool from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing for the React Native client
app.use(cors());

// Custom request logger to debug connectivity
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Parse JSON request bodies
app.use(express.json());

// Auto-run schema migrations on database connection
const initDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
      console.log('✅ Database schema verified and initialized');
    }
  } catch (error) {
    console.error('⚠️ Database schema initialization notice:', error);
  }
};

// Root endpoint for deployment landing check
app.get('/', (req, res) => {
  res.json({
    app: 'Grocify API Server',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/health',
  });
});

// Routes configuration
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', message: 'Grocify API Server is healthy and running' });
});

// Boot the server
app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🌱 Grocify API Server successfully booted`);
  console.log(`📡 Listening on port: ${PORT}`);
  console.log(`=========================================`);
  await initDatabase();
});
