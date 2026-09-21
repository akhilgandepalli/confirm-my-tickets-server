import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';

dotenv.config();

const movies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    duration: 166,
    rating: 8.8,
    releaseDate: new Date('2024-03-01'),
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=400&fit=crop',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    director: 'Denis Villeneuve',
    status: 'now_showing',
    isFeatured: true,
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    duration: 180,
    rating: 8.5,
    releaseDate: new Date('2023-07-21'),
    poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
    banner: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=400&fit=crop',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
    director: 'Christopher Nolan',
    status: 'now_showing',
    isFeatured: true,
  },
  {
    title: 'Animal',
    description: 'A father-son relationship story set against the backdrop of a violent underworld.',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'Hindi',
    duration: 201,
    rating: 7.2,
    releaseDate: new Date('2023-12-01'),
    poster: 'https://www.masala.com/wp-content/uploads/cloud/2023/09/22/image-17.png',
    banner: 'https://variety.com/wp-content/uploads/2022/12/Animal-first-look.jpg?w=1000&h=563&crop=1',
    cast: ['Ranbir Kapoor', 'Rashmika Mandanna', 'Anil Kapoor'],
    director: 'Sandeep Reddy Vanga',
    status: 'now_showing',
    isFeatured: false,
  },
  {
    title: 'Deadpool & Wolverine',
    description: 'Deadpool is offered a place in the Marvel Cinematic Universe by the Time Variance Authority.',
    genre: ['Action', 'Comedy', 'Adventure'],
    language: 'English',
    duration: 128,
    rating: 8.0,
    releaseDate: new Date('2024-07-26'),
    poster: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/c27ba9204336663.66a77fa3e6d96.png',
    banner: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1200&h=400&fit=crop',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin'],
    director: 'Shawn Levy',
    status: 'coming_soon',
    isFeatured: true,
  },
  {
    title: 'Pushpa 2: The Rule',
    description: 'The clash between Pushpa Raj and his rivals intensifies in the red sandalwood smuggling saga.',
    genre: ['Action', 'Drama', 'Thriller'],
    language: 'Telugu',
    duration: 175,
    rating: 7.8,
    releaseDate: new Date('2024-12-06'),
    poster: 'https://data.indianexpress.com/election2019/about/images/movie/pushpa-2-movie.jpg?w=195',
    banner: 'https://www.masala.com/wp-content/uploads/cloud/2024/10/03/Pushpa-2-1000x563.png',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    director: 'Sukumar',
    status: 'coming_soon',
    isFeatured: false,
  },
  {
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    language: 'English',
    duration: 169,
    rating: 8.7,
    releaseDate: new Date('2014-11-07'),
    poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    director: 'Christopher Nolan',
    status: 'now_showing',
    isFeatured: false,
  },
  {
    title: 'Kalki 2898 AD',
    description: 'A modern avatar of the Hindu god Vishnu descends to earth to protect the world from evil forces in a dystopian future.',
    genre: ['Sci-Fi', 'Action', 'Fantasy'],
    language: 'Telugu',
    duration: 181,
    rating: 8.2,
    releaseDate: new Date('2024-06-27'),
    poster: 'https://www.5movierulz.fitness/uploads/Kalki-2898-AD-Telugu.jpg',
    banner: 'https://i.cdn.newsbytesapp.com/images/l60420241111121748.jpeg',
    cast: ['Prabhas', 'Amitabh Bachchan', 'Deepika Padukone', 'Kamal Haasan'],
    director: 'Nag Ashwin',
    status: 'now_showing',
    isFeatured: true,
  },
  {
    title: 'Devara: Part 1',
    description: 'An epic action saga set against coastal lands, exploring fear, courage, and redemption.',
    genre: ['Action', 'Drama', 'Thriller'],
    language: 'Telugu',
    duration: 178,
    rating: 7.9,
    releaseDate: new Date('2024-09-27'),
    poster: 'https://static.toiimg.com/photo/msid-113734788/113734788.jpg?31084',
    banner: 'https://static.toiimg.com/photo/113587323.cms?resizemode=4',
    cast: ['N.T. Rama Rao Jr.', 'Janhvi Kapoor', 'Saif Ali Khan'],
    director: 'Koratala Siva',
    status: 'now_showing',
    isFeatured: true,
  }
];

const generateRowNames = (rowCount) => {
  return Array.from({ length: rowCount }, (_, i) => String.fromCharCode(65 + i));
};

const theaters = [
  // 10 Famous Theaters in Hyderabad
  {
    name: "Prasad's Multiplex & Large Screen",
    city: 'Hyderabad',
    address: 'NTR Gardens, Necklace Road, Khairatabad',
    screens: 6,
    amenities: ['Large Screen', 'Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Food Court'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=300&fit=crop',
    seatingLayout: { rows: 12, cols: 14, screenPosition: 'top', rowNames: generateRowNames(12) },
  },
  {
    name: 'AMB Cinemas',
    city: 'Hyderabad',
    address: 'Sarath City Capital Mall, Gachibowli - Miyapur Rd, Kondapur',
    screens: 7,
    amenities: ['VIP Lounge', 'Dolby Atmos', 'Laser Projection', 'Valet Parking', 'Gourmet Food'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=300&fit=crop',
    seatingLayout: { rows: 10, cols: 12, screenPosition: 'top', rowNames: generateRowNames(10) },
  },
  {
    name: 'PVR: Forum Sujana Mall',
    city: 'Hyderabad',
    address: 'Nexus Mall, KPHB Phase 9, Kukatpally',
    screens: 9,
    amenities: ['IMAX', '4DX', 'P[XL]', 'Dolby Atmos', 'Gold Class Recliners'],
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=300&fit=crop',
    seatingLayout: { rows: 11, cols: 12, screenPosition: 'top', rowNames: generateRowNames(11) },
  },
  {
    name: 'INOX: GVK One Mall',
    city: 'Hyderabad',
    address: 'Road No 1, Balapur Basthi, Banjara Hills',
    screens: 6,
    amenities: ['Insignia Luxury', 'Dolby Atmos', 'Plush Recliners', 'Live Kitchen'],
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=300&fit=crop',
    seatingLayout: { rows: 8, cols: 10, screenPosition: 'top', rowNames: generateRowNames(8) },
  },
  {
    name: 'Sudarshan 35MM',
    city: 'Hyderabad',
    address: 'RTC X Roads, Chikkadpally',
    screens: 1,
    amenities: ['4K Dolby Atmos', 'Giant Screen', 'Balcony Seating', 'Iconic Single Screen'],
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&h=300&fit=crop',
    seatingLayout: { rows: 14, cols: 16, screenPosition: 'top', rowNames: generateRowNames(14) },
  },
  {
    name: 'Sandhya 70MM',
    city: 'Hyderabad',
    address: 'RTC X Roads, Chikkadpally',
    screens: 1,
    amenities: ['Dolby Atmos', 'Dual 4K Laser', 'Grand Balcony', 'Vintage Cinema Charm'],
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=300&fit=crop',
    seatingLayout: { rows: 14, cols: 16, screenPosition: 'top', rowNames: generateRowNames(14) },
  },
  {
    name: 'Cinepolis: CCPL Mall',
    city: 'Hyderabad',
    address: 'CCPL Mall, Malkajgiri',
    screens: 5,
    amenities: ['RealD 3D', 'Dolby 7.1', 'Coffee Tree Cafe', 'Premium Rocker Seats'],
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=300&fit=crop',
    seatingLayout: { rows: 10, cols: 10, screenPosition: 'top', rowNames: generateRowNames(10) },
  },
  {
    name: 'Miraj Cinemas: Shalini Shivani',
    city: 'Hyderabad',
    address: 'Dilsukhnagar Main Road, Dilsukhnagar',
    screens: 4,
    amenities: ['Dolby Atmos', 'RGB Laser', 'Chef Corner', 'Recliner Section'],
    image: 'https://images.unsplash.com/photo-1574267432550-4e7d4e8e8f8e?w=600&h=300&fit=crop',
    seatingLayout: { rows: 10, cols: 12, screenPosition: 'top', rowNames: generateRowNames(10) },
  },
  {
    name: 'PVR: Next Galleria Mall',
    city: 'Hyderabad',
    address: 'Panjagutta Metro Station, Panjagutta',
    screens: 8,
    amenities: ['4DX', 'PlayHouse', 'Dolby Atmos', 'Quick Bites'],
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=300&fit=crop',
    seatingLayout: { rows: 10, cols: 10, screenPosition: 'top', rowNames: generateRowNames(10) },
  },
  {
    name: 'Asian Shiva Ganga Cinema',
    city: 'Hyderabad',
    address: 'Opp Shivaji Statue, Dilsukhnagar',
    screens: 2,
    amenities: ['Barco 4K Laser', 'Dolby Atmos', 'Comfort Seating', 'Cafeteria'],
    image: 'https://images.unsplash.com/photo-1594909122825-c9a698090536?w=600&h=300&fit=crop',
    seatingLayout: { rows: 12, cols: 12, screenPosition: 'top', rowNames: generateRowNames(12) },
  },

  // 10 Famous Theaters in Visakhapatnam
  {
    name: 'Jagadamba 70MM Theatre',
    city: 'Visakhapatnam',
    address: 'Jagadamba Junction, Suryabagh',
    screens: 1,
    amenities: ['Iconic 70MM Screen', 'Dolby Atmos', 'RGB Laser 4K', 'Balcony & Royal Class'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=300&fit=crop',
    seatingLayout: { rows: 15, cols: 16, screenPosition: 'top', rowNames: generateRowNames(15) },
  },
  {
    name: 'INOX: Varun Beach',
    city: 'Visakhapatnam',
    address: 'Beach Road, Maharani Peta',
    screens: 6,
    amenities: ['Sea View Lounge', 'Dolby Atmos', 'Insignia Luxury', 'Gourmet Delights'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=300&fit=crop',
    seatingLayout: { rows: 10, cols: 12, screenPosition: 'top', rowNames: generateRowNames(10) },
  },
  {
    name: 'Cinepolis: CMR Central',
    city: 'Visakhapatnam',
    address: 'CMR Central Mall, Maddilapalem, NH16',
    screens: 5,
    amenities: ['RealD 3D', 'Dolby Atmos', 'Coffee Tree Cafe', 'Luxury Recliners'],
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=300&fit=crop',
    seatingLayout: { rows: 10, cols: 10, screenPosition: 'top', rowNames: generateRowNames(10) },
  },
  {
    name: 'Sangam Sarat Theatre',
    city: 'Visakhapatnam',
    address: 'RTC Complex Road, Dwaraka Nagar',
    screens: 2,
    amenities: ['4K Dolby Atmos', 'Dual Screen', 'Luxury Balcony', 'Food Court'],
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=300&fit=crop',
    seatingLayout: { rows: 12, cols: 14, screenPosition: 'top', rowNames: generateRowNames(12) },
  },
  {
    name: 'Kameswari Picture Palace',
    city: 'Visakhapatnam',
    address: 'Near RTC Complex, Dwaraka Nagar',
    screens: 1,
    amenities: ['Dolby 7.1', 'Laser Projection', 'Central AC', 'Snack Bar'],
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&h=300&fit=crop',
    seatingLayout: { rows: 12, cols: 12, screenPosition: 'top', rowNames: generateRowNames(12) },
  },
  {
    name: 'V Max Cinemas',
    city: 'Visakhapatnam',
    address: 'Jagadamba Centre, Near Jagadamba Theatre',
    screens: 3,
    amenities: ['Dolby Atmos', 'Laser 4K', 'Pushback Chairs', 'Concession Stand'],
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=300&fit=crop',
    seatingLayout: { rows: 10, cols: 10, screenPosition: 'top', rowNames: generateRowNames(10) },
  },
  {
    name: 'Sarat Theatre',
    city: 'Visakhapatnam',
    address: 'Station Road, Dwaraka Nagar',
    screens: 1,
    amenities: ['Dolby Atmos', 'Barco Laser', 'Premium Balcony', 'Spacious Seating'],
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=300&fit=crop',
    seatingLayout: { rows: 12, cols: 12, screenPosition: 'top', rowNames: generateRowNames(12) },
  },
  {
    name: 'Sri Venkateswara A/C Theatre',
    city: 'Visakhapatnam',
    address: 'Old Gajuwaka Main Road, Gajuwaka',
    screens: 2,
    amenities: ['Dolby Digital', '4K Projection', 'Central AC', 'Canteen'],
    image: 'https://images.unsplash.com/photo-1574267432550-4e7d4e8e8f8e?w=600&h=600&fit=crop',
    seatingLayout: { rows: 12, cols: 14, screenPosition: 'top', rowNames: generateRowNames(12) },
  },
  {
    name: 'STBL Cine World',
    city: 'Visakhapatnam',
    address: 'Sheela Nagar, Near BHPV Post',
    screens: 6,
    amenities: ['Multiplex Experience', 'Dolby Atmos', 'Game Zone', 'Food Court'],
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=300&fit=crop',
    seatingLayout: { rows: 10, cols: 12, screenPosition: 'top', rowNames: generateRowNames(10) },
  },
  {
    name: 'Melody Theatre',
    city: 'Visakhapatnam',
    address: 'Opp Police Barracks, Jagadamba Junction',
    screens: 1,
    amenities: ['Dolby Atmos', '4K RGB Laser', 'Classic Single Screen', 'Snack Bar'],
    image: 'https://images.unsplash.com/photo-1594909122825-c9a698090536?w=600&h=300&fit=crop',
    seatingLayout: { rows: 14, cols: 14, screenPosition: 'top', rowNames: generateRowNames(14) },
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany(),
      Movie.deleteMany(),
      Theater.deleteMany(),
      Show.deleteMany(),
    ]);

    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    await User.create([
      { name: 'Admin User', email: 'admin@confirmmytickets.com', password: adminPassword, role: 'admin', phone: '9876543210' },
      { name: 'John Doe', email: 'user@confirmmytickets.com', password: userPassword, role: 'user', phone: '9123456789' },
    ]);

    const createdMovies = await Movie.insertMany(movies);
    const createdTheaters = await Theater.insertMany(theaters);

    console.log(`Database seeded successfully!`);
    console.log(`- Movies created: ${createdMovies.length}`);
    console.log(`- Theaters created: ${createdTheaters.length} (10 Hyderabad, 10 Visakhapatnam)`);
    console.log(`- Shows: 0 (Use 'npm run seed:shows' or 'node seed/showSeeddata.js' to generate shows)`);
    console.log('Admin login: admin@confirmmytickets.com / admin123');
    console.log('User login: user@confirmmytickets.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
