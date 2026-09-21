import express from 'express';
import Show from '../models/Show.js';
import Theater from '../models/Theater.js';
import Movie from '../models/Movie.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { movie, theater, city, date, search, sortBy, order, page, limit } = req.query;
    const filter = {};

    if (movie) filter.movie = movie;
    if (theater) filter.theater = theater;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    // Determine sort
    let sortOption = { createdAt: -1 }; // Default: New to Old
    if (sortBy) {
      const sortOrder = order === 'asc' ? 1 : -1;
      if (sortBy === 'date') sortOption = { date: sortOrder, startTime: sortOrder };
      else if (sortBy === 'price') sortOption = { price: sortOrder };
      else if (sortBy === 'startTime') sortOption = { startTime: sortOrder };
      else if (sortBy === 'createdAt') sortOption = { createdAt: sortOrder };
      else sortOption = { [sortBy]: sortOrder };
    }

    let query = Show.find(filter)
      .populate('movie', 'title poster duration rating language genre')
      .populate('theater', 'name city address screens amenities seatingLayout')
      .sort(sortOption);

    let shows = await query;

    // Filter by city if specified
    if (city) {
      shows = shows.filter((s) =>
        s.theater?.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Search filter across movie title, theater name, city, screen
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      shows = shows.filter((s) =>
        s.movie?.title?.toLowerCase().includes(term) ||
        s.theater?.name?.toLowerCase().includes(term) ||
        s.theater?.city?.toLowerCase().includes(term) ||
        s.screen?.toLowerCase().includes(term)
      );
    }

    // If pagination params are provided
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const total = shows.length;
      const totalPages = Math.ceil(total / limitNum);
      const paginatedShows = shows.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.json({
        shows: paginatedShows,
        total,
        page: pageNum,
        totalPages,
        limit: limitNum,
      });
    }

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theater');
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const showData = { ...req.body };

    // Auto-populate seatingLayout and totalSeats from Theater if not fully specified
    if (showData.theater) {
      const theaterDoc = await Theater.findById(showData.theater);
      if (theaterDoc && theaterDoc.seatingLayout) {
        if (!showData.seatLayout) {
          showData.seatLayout = {
            rows: theaterDoc.seatingLayout.rows || 10,
            cols: theaterDoc.seatingLayout.cols || 10,
            screenPosition: theaterDoc.seatingLayout.screenPosition || 'top',
            rowNames: theaterDoc.seatingLayout.rowNames?.length
              ? theaterDoc.seatingLayout.rowNames
              : Array.from({ length: theaterDoc.seatingLayout.rows || 10 }, (_, i) => String.fromCharCode(65 + i)),
          };
        }
        if (!showData.totalSeats) {
          showData.totalSeats = (showData.seatLayout.rows || 10) * (showData.seatLayout.cols || 10);
        }
      }
    }

    const show = await Show.create(showData);
    const populated = await Show.findById(show._id)
      .populate('movie', 'title poster duration rating language genre')
      .populate('theater', 'name city address screens amenities seatingLayout');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('movie', 'title poster')
      .populate('theater', 'name city');
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json({ message: 'Show deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
