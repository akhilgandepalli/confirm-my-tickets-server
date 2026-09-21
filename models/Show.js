import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    screen: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number, required: true },
    totalSeats: { type: Number, default: 100 },
    bookedSeats: [{ type: String }],
    seatLayout: {
      rows: { type: Number, default: 10 },
      cols: { type: Number, default: 10 },
      screenPosition: { type: String, enum: ['top', 'bottom'], default: 'top' },
      rowNames: [{ type: String }],
    },
  },
  { timestamps: true }
);

showSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - (this.bookedSeats?.length || 0);
});

showSchema.set('toJSON', { virtuals: true });
showSchema.set('toObject', { virtuals: true });

export default mongoose.model('Show', showSchema);
