import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';

dotenv.config();

const products = [
  {
    name: 'FL-05',
    slug: 'fl-05',
    series: 'Training Series',
    price: 1500,
    description: 'Developed for high-intensity training sessions. The FL-05 offers the perfect balance between professional flight feel and extreme durability.',
    image: 'https://images.unsplash.com/photo-1626225453014-49774309ba83?q=80&w=800&auto=format&fit=crop',
    stock: 100,
    metadata: {
      feathers: 'Grade B Goose Feather',
      speed: '77/78',
      durability: 'High',
      stability: 'Consistent',
      features: [
        'Reinforced Feather Shaft',
        'Synthetic Cork Base',
        'Optimized for Repetitive Drills',
        'Weather Resistant',
      ],
    },
  },
  {
    name: 'FL-10',
    slug: 'fl-10',
    series: 'Club Series',
    price: 2000,
    description: 'The industry standard for club-level competitive play. Engineered with hand-selected Grade A feathers and a composite cork base.',
    image: 'https://images.unsplash.com/photo-1613919113166-2990050bc83a?q=80&w=800&auto=format&fit=crop',
    stock: 100,
    metadata: {
      feathers: 'Grade A Duck Feather',
      speed: '77/78',
      durability: 'Professional',
      stability: 'Elite',
      features: [
        'Hand-Selected Feathers',
        'Composite Wood Cork',
        'Predictable Flight Path',
        'Standardized Speed Calibration',
      ],
    },
  },
  {
    name: 'FL-15',
    slug: 'fl-15',
    series: 'Tournament Series',
    price: 2500,
    description: 'Our flagship shuttlecock. Used in national-level tournaments where zero-margin for error is the requirement.',
    image: 'https://images.unsplash.com/photo-1599474924187-334a4ae593c0?q=80&w=800&auto=format&fit=crop',
    stock: 100,
    metadata: {
      feathers: 'Grade A+ Goose Feather',
      speed: '77/78',
      durability: 'Supreme',
      stability: 'Perfect',
      features: [
        'A+ Ultra-Premium Goose Feather',
        '100% Natural Solid Cork',
        'International Tournament Approved',
        '18-Point Flight Calibration',
      ],
    },
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/aerion';
    await mongoose.connect(mongoUri);
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert new products
    await Product.insertMany(products);
    
    console.log('Database Seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
