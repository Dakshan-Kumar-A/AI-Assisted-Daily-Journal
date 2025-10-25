import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'neutral', 'excited', 'anxious', 'calm', 'angry', 'grateful'],
    default: 'neutral'
  },
  aiSummary: {
    type: String,
    default: ''
  },
  aiMood: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

export default mongoose.model('Journal', journalSchema);