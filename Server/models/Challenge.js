import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['history', 'fun', 'birthday', 'invention', 'trivia'],
    default: 'trivia'
  },
  completed: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create compound index to ensure one challenge per user per day
challengeSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('Challenge', challengeSchema);