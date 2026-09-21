import express from 'express';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, admin, async (_req, res) => {
  try {
    const [users, movies, theaters, shows, bookings, revenue, cityList, topMovies] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Theater.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Theater.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 }, totalScreens: { $sum: '$screens' } } },
        { $sort: { count: -1 } }
      ]),
      Movie.find({ status: 'now_showing' }).select('title rating genre poster language duration').limit(5)
    ]);

    const recentBookings = await Booking.find({ status: 'confirmed' })
      .populate('user', 'name email phone')
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title poster duration' },
          { path: 'theater', select: 'name city address' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      users,
      movies,
      theaters,
      shows,
      bookings,
      revenue: revenue[0]?.total || 0,
      recentBookings,
      cityStats: cityList,
      topMovies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', protect, admin, async (_req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
