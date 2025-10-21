import express from 'express';
import Journal from '../models/Journal.js';
import { protect } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
const router = express.Router();

// Initialize OpenAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeWithAI = async (content) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze this journal entry and provide: 1) A brief 2-sentence summary, 2) The detected mood (choose from: happy, sad, neutral, excited, anxious, calm, angry, grateful). Format your response as JSON with keys 'summary' and 'mood'.\n\nJournal entry: ${content}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    
    return {
      summary: parsed.summary || 'No summary available',
      mood: parsed.mood || 'neutral'
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      summary: 'AI analysis unavailable',
      mood: 'neutral'
    };
  }
};
// @route   GET /api/journals
// @desc    Get all journals for user
router.get('/', protect, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/journals/:id
// @desc    Get single journal
router.get('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    // Check ownership
    if (journal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/journals
// @desc    Create new journal
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    // Get AI analysis
    const aiAnalysis = await analyzeWithAI(content);

    const journal = await Journal.create({
      user: req.user._id,
      title,
      content,
      tags: tags || [],
      aiSummary: aiAnalysis.summary,
      aiMood: aiAnalysis.mood,
      mood: aiAnalysis.mood
    });

    res.status(201).json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/journals/:id
// @desc    Update journal
router.put('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    // Check ownership
    if (journal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, tags } = req.body;

    // Re-analyze with AI if content changed
    let aiAnalysis = { summary: journal.aiSummary, mood: journal.aiMood };
    if (content && content !== journal.content) {
      aiAnalysis = await analyzeWithAI(content);
    }

    journal.title = title || journal.title;
    journal.content = content || journal.content;
    journal.tags = tags || journal.tags;
    journal.aiSummary = aiAnalysis.summary;
    journal.aiMood = aiAnalysis.mood;
    journal.mood = aiAnalysis.mood;

    await journal.save();
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/journals/:id
// @desc    Delete journal
router.delete('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    // Check ownership
    if (journal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await journal.deleteOne();
    res.json({ message: 'Journal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/journals/stats/weekly
// @desc    Get weekly journal stats
router.get('/stats/weekly', protect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const journals = await Journal.find({
      user: req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Group by day
    const stats = {};
    journals.forEach(journal => {
      const date = journal.createdAt.toISOString().split('T')[0];
      stats[date] = (stats[date] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;