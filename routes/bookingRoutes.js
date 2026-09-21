import express from 'express';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const generateBookingId = () => {
  return 'CMT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
};

router.get('/', protect, admin, async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title poster' },
          { path: 'theater', select: 'name city' },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title poster duration' },
          { path: 'theater', select: 'name city address' },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title poster duration' },
          { path: 'theater', select: 'name city address' },
        ],
      });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { showId, seats, paymentMethod } = req.body;

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: 'Show not found' });

    const unavailable = seats.filter((seat) => show.bookedSeats.includes(seat));
    if (unavailable.length > 0) {
      return res.status(400).json({
        message: 'Some seats are already booked',
        unavailableSeats: unavailable,
      });
    }

    const totalAmount = seats.length * show.price;
    show.bookedSeats.push(...seats);
    await show.save();

    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      seats,
      totalAmount,
      paymentMethod: paymentMethod || 'card',
      bookingId: generateBookingId(),
      status: 'confirmed',
    });

    const populated = await Booking.findById(booking._id)
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title poster duration' },
          { path: 'theater', select: 'name city address' },
        ],
      });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    const show = await Show.findById(booking.show);
    if (show) {
      show.bookedSeats = show.bookedSeats.filter((s) => !booking.seats.includes(s));
      await show.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
