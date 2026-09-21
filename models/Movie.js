import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: [{ type: String }],
    language: { type: String, required: true },
    duration: { type: Number, required: true },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    releaseDate: { type: Date, required: true },
    poster: { type: String, default: '' },
    banner: { type: String, default: '' },
    cast: [{ type: String }],
    director: { type: String, default: '' },
    status: { type: String, enum: ['now_showing', 'coming_soon', 'ended'], default: 'now_showing' },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
