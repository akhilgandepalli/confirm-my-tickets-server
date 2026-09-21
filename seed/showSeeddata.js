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

const seedShows = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch existing movies and theaters from DB
    const [movies, theaters] = await Promise.all([
      Movie.find({ status: 'now_showing' }),
      Theater.find(),
    ]);

    if (movies.length === 0) {
      console.error('No now_showing movies found! Please run "npm run seed" first.');
      process.exit(1);
    }

    if (theaters.length === 0) {
      console.error('No theaters found! Please run "npm run seed" first.');
      process.exit(1);
    }

    console.log(`Found ${movies.length} active movies and ${theaters.length} theaters.`);

    // Clear existing shows before seeding new 7-day schedule
    await Show.deleteMany({});
    console.log('Cleared previous shows.');

    const showsToInsert = [];

    // Current dynamic date (Day 0 = Today)
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    console.log(`Generating shows for 7 consecutive days starting from ${baseDate.toLocaleDateString('en-US', dateOptions)}...`);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + dayOffset);

      // Iterate through theaters and assign shows for movies
      theaters.forEach((theater, tIndex) => {
        const layout = theater.seatingLayout || {
          rows: 10,
          cols: 10,
          screenPosition: 'top',
          rowNames: generateRowNames(10),
        };
        const totalSeats = (layout.rows || 10) * (layout.cols || 10);
        const screenCount = theater.screens || 1;

        // Determine which movies to play in this theater on this day
        // Distribute movies across theaters and screens
        for (let s = 0; s < Math.min(screenCount, 3); s++) {
          const movie = movies[(tIndex + s + dayOffset) % movies.length];
          const screenName = `Screen ${s + 1}`;

          // Pick 2-3 showtimes for this screen
          const selectedTimes = showTimes.slice(0, 3);
          selectedTimes.forEach((timeSlot, timeIdx) => {
            const basePrice = 200 + ((tIndex + timeIdx) % 3) * 50; // e.g. 200, 250, 300

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

    console.log(`Inserting ${showsToInsert.length} shows into the database...`);
    await Show.insertMany(showsToInsert);

    const endDate = new Date(baseDate);
    endDate.setDate(baseDate.getDate() + 6);

    console.log(' Shows successfully seeded!');
    console.log(`- Total shows created: ${showsToInsert.length}`);
    console.log(`- Date range: ${baseDate.toLocaleDateString('en-US', dateOptions)} to ${endDate.toLocaleDateString('en-US', dateOptions)} (7 consecutive days)`);
    console.log(`- Theaters covered: ${theaters.length}`);
    console.log(`- Movies featured: ${movies.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding shows:', error);
    process.exit(1);
  }
};

seedShows();
