import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import journalRoutes from './routes/journal.js';
<<<<<<< HEAD
=======
import newsRoutes from './routes/news.js';

// Add after other routes
>>>>>>> edbd1ccbbcffee205aa5f0610c10f86792a6517e

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/journals', journalRoutes);
<<<<<<< HEAD
=======
app.use('/api/news', newsRoutes);
>>>>>>> edbd1ccbbcffee205aa5f0610c10f86792a6517e

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});