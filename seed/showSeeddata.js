import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';

dotenv.config();

const showTimes = [
  { start: '10:00 AM', end: '01:00 PM' },
  { start: '01:45 PM', end: '04:45 PM' },
  { start: '05:30 PM', end: '08:30 PM' },
  { start: '09:15 PM', end: '12:15 AM' },
];

const generateRowNames = (rowCount) => {
  return Array.from({ length: rowCount }, (_, i) => String.fromCharCode(65 + i));
};

let isSeedingInProgress = false;

/**
 * Generates and seeds shows for 7 consecutive days starting from today.
 */
export const seedShows = async () => {
  if (isSeedingInProgress) {
    console.log('[ShowSeed] Seeding already in progress, skipping duplicate call.');
    return;
  }

  try {
    isSeedingInProgress = true;

    // Fetch existing movies and theaters from DB
    const [movies, theaters] = await Promise.all([
      Movie.find({ status: 'now_showing' }),
      Theater.find(),
    ]);

    if (movies.length === 0) {
      console.log('[ShowSeed] No now_showing movies found to seed shows.');
      return;
    }

    if (theaters.length === 0) {
      console.log('[ShowSeed] No theaters found to seed shows.');
      return;
    }

    // Clear previous shows
    await Show.deleteMany({});
    console.log('[ShowSeed] Cleared previous shows.');

    const showsToInsert = [];

    // Current dynamic date (Day 0 = Today)
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    console.log(`[ShowSeed] Generating shows for 7 consecutive days starting from ${baseDate.toLocaleDateString('en-US', dateOptions)}...`);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + dayOffset);

      theaters.forEach((theater, tIndex) => {
        const layout = theater.seatingLayout || {
          rows: 10,
          cols: 10,
          screenPosition: 'top',
          rowNames: generateRowNames(10),
        };
        const totalSeats = (layout.rows || 10) * (layout.cols || 10);
        const screenCount = theater.screens || 1;

        for (let s = 0; s < Math.min(screenCount, 3); s++) {
          const movie = movies[(tIndex + s + dayOffset) % movies.length];
          const screenName = `Screen ${s + 1}`;

          const selectedTimes = showTimes.slice(0, 3);
          selectedTimes.forEach((timeSlot, timeIdx) => {
            const basePrice = 200 + ((tIndex + timeIdx) % 3) * 50;

            showsToInsert.push({
              movie: movie._id,
              theater: theater._id,
              screen: screenName,
              date: currentDate,
              startTime: timeSlot.start,
              endTime: timeSlot.end,
              price: basePrice,
              totalSeats: totalSeats,
              bookedSeats: [],
              seatLayout: {
                rows: layout.rows || 10,
                cols: layout.cols || 10,
                screenPosition: layout.screenPosition || 'top',
                rowNames: layout.rowNames && layout.rowNames.length > 0 ? layout.rowNames : generateRowNames(layout.rows || 10),
              },
            });
          });
        }
      });
    }

    await Show.insertMany(showsToInsert);

    const endDate = new Date(baseDate);
    endDate.setDate(baseDate.getDate() + 6);

    console.log(`[ShowSeed] Successfully seeded ${showsToInsert.length} shows for 7 consecutive days (${baseDate.toLocaleDateString('en-US', dateOptions)} to ${endDate.toLocaleDateString('en-US', dateOptions)}).`);
  } catch (error) {
    console.error('[ShowSeed] Error seeding shows:', error);
  } finally {
    isSeedingInProgress = false;
  }
};

/**
 * Checks if all shows in DB are in the past (expired) or if no shows exist.
 * If expired, automatically runs seedShows() to replenish shows for the next 7 days.
 */
export const autoSeedShowsIfExpired = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count how many shows exist with date >= today
    const upcomingShowsCount = await Show.countDocuments({ date: { $gte: today } });

    if (upcomingShowsCount === 0) {
      console.log(`[AutoSeed] All show dates have passed or no shows found. Auto-seeding 7 days of shows starting from today (${today.toLocaleDateString()})...`);
      await seedShows();
    }
  } catch (error) {
    console.error('[AutoSeed] Error checking show expiration:', error);
  }
};

// If run directly via CLI (e.g. npm run seed:shows or node seed/showSeeddata.js)
const isDirectRun = process.argv[1] && process.argv[1].endsWith('showSeeddata.js');
if (isDirectRun) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      await seedShows();
      process.exit(0);
    })
    .catch((err) => {
      console.error('CLI Seed Error:', err);
      process.exit(1);
    });
}
