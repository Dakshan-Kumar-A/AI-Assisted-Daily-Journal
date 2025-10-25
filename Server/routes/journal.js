import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Journal from '../models/Journal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Lazily initialize Gemini client so dotenv can load before use
let genAI = null;
const initGenAI = () => {
  if (genAI) return genAI;
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI;
  } catch (e) {
    console.error('Failed to initialize Gemini client:', e);
    return null;
  }
};

const analyzeWithAI = async (content) => {
  const client = initGenAI();
  if (!client || !content) {
    return { summary: 'AI analysis unavailable', mood: 'neutral' };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Analyze this journal entry and provide:
1) A brief 1-2 sentence summary.
2) The detected mood (choose from: happy, sad, neutral, excited, anxious, calm, angry, grateful).
Return valid JSON with keys "summary" and "mood".

Journal entry:
${content}`;

  const result = await model.generateContent(prompt);

    // Normalize different possible SDK shapes and extract text
    let text = '';
    if (!result) text = '';
    else if (typeof result === 'string') text = result;
    else if (result?.response) {
      const resp = result.response;
      if (typeof resp === 'string') text = resp;
      else if (typeof resp.text === 'function') text = await resp.text();
      else text = String(resp);
    } else if (Array.isArray(result?.output)) {
      text = result.output.map((o) => {
        if (o?.content && Array.isArray(o.content)) {
          return o.content.map((c) => c.text || '').join('');
        }
        return o?.text || '';
      }).join('');
    } else if (typeof result?.text === 'function') {
      text = await result.text();
    } else {
      text = String(result);
    }

    // Try parse JSON; fallback to extracting JSON substring
    let parsed = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }

    return {
      summary: parsed.summary || 'No summary available',
      mood: parsed.mood || 'neutral'
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return { summary: 'AI analysis unavailable', mood: 'neutral' };
  }
};

// Stats and auxiliary routes (place before parameterized routes)
router.get('/stats/weekly', protect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const journals = await Journal.find({
      user: req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    });

    const stats = {};
    journals.forEach((j) => {
      const date = j.createdAt.toISOString().split('T')[0];
      stats[date] = (stats[date] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats/moods', protect, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id });
    const moodCount = journals.reduce((acc, j) => {
      const m = j.mood || j.aiMood || 'neutral';
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    res.json(moodCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats/streak', protect, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id }).sort({ createdAt: -1 });
    if (journals.length === 0) return res.json({ streak: 0 });

    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let i = 0; i < journals.length; i++) {
      const entryDate = new Date(journals[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((cursor - entryDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        cursor = new Date(entryDate);
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/trivia/daily', protect, async (req, res) => {
  try {
    const today = new Date();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.getDate();

    if (!genAI) {
      return res.json({
        date: `${month} ${day}`,
        events: [
          'Every day is a chance to write your story.',
          'Journaling has been practiced for thousands of years.',
          'Today is a perfect day to reflect on your journey.'
        ]
      });
    }

    const prompt = `Provide 3 concise interesting historical events, fun facts, or notable birthdays that happened on ${month} ${day}. Return valid JSON with keys "event1","event2","event3".`;

    const result = await genAI.getGenerativeModel({ model: 'gemini-pro' }).generateContent(prompt);

    // extract text
    let text = '';
    if (result?.response) {
      const r = result.response;
      if (typeof r === 'string') text = r;
      else if (typeof r.text === 'function') text = await r.text();
      else text = String(r);
    } else if (typeof result === 'string') text = result;
    else text = JSON.stringify(result);

    let parsed = {};
    try { parsed = JSON.parse(text); } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }

    res.json({
      date: `${month} ${day}`,
      events: [parsed.event1 || '', parsed.event2 || '', parsed.event3 || ''].filter(Boolean)
    });
  } catch (error) {
    console.error('Trivia Error:', error);
    res.json({
      date: new Date().toLocaleDateString(),
      events: [
        'Every day is a chance to write your story',
        'Journaling has been practiced for thousands of years',
        'Today is a perfect day to reflect on your journey'
      ]
    });
  }
});

router.post('/challenge/submit', protect, async (req, res) => {
  try {
    // placeholder - implement storage if needed
    res.json({ success: true, message: 'Challenge completed!', points: 10 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CRUD routes

// GET /api/journals
router.get('/', protect, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/journals/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    if (journal.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/journals
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
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

// PUT /api/journals/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    if (journal.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const { title, content, tags } = req.body;

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

// DELETE /api/journals/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    if (journal.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    await journal.deleteOne();
    res.json({ message: 'Journal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;