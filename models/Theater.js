import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    screens: { type: Number, default: 1 },
    amenities: [{ type: String }],
    image: { type: String, default: '' },
    seatingLayout: {
      rows: { type: Number, default: 10 },
      cols: { type: Number, default: 10 },
      screenPosition: { type: String, enum: ['top', 'bottom'], default: 'top' },
      rowNames: [{ type: String }],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Theater', theaterSchema);
