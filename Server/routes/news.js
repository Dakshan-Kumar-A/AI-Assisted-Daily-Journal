import express from 'express';
import fetch from 'node-fetch';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/news/local
// @desc    Get local news based on user location
router.get('/local', protect, async (req, res) => {
  try {
    const { country = 'us' } = req.query;
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return res.json({
        articles: [
          {
            title: "Stay informed about your world",
            description: "Add NEWS_API_KEY to .env to see real news",
            url: "#"
          }
        ]
      });
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=5&apiKey=${apiKey}`
    );
    
    const data = await response.json();
    
    res.json({
      articles: data.articles || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/news/trending
// @desc    Get trending topics
router.get('/trending', protect, async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return res.json({
        articles: []
      });
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=general&pageSize=5&apiKey=${apiKey}`
    );
    
    const data = await response.json();
    
    res.json({
      articles: data.articles || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;