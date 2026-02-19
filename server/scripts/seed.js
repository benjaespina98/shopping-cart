import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for seeding...');

  // Create admin user
  const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: 'Administrador',
      email: process.env.ADMIN_EMAIL || 'admin@mitienda.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      role: 'admin',
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Sample products
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        name: 'Producto Demo 1',
        description: 'Descripción del producto demo 1',
        price: 1500,
        stock: 20,
        category: 'General',
        featured: true,
        images: [{ url: 'https://placehold.co/400x400?text=Producto+1', publicId: 'demo1' }],
      },
      {
        name: 'Producto Demo 2',
        description: 'Descripción del producto demo 2',
        price: 2800,
        stock: 15,
        category: 'General',
        featured: true,
        images: [{ url: 'https://placehold.co/400x400?text=Producto+2', publicId: 'demo2' }],
      },
      {
        name: 'Producto Demo 3',
        description: 'Descripción del producto demo 3',
        price: 950,
        stock: 50,
        category: 'Oferta',
        images: [{ url: 'https://placehold.co/400x400?text=Producto+3', publicId: 'demo3' }],
      },
    ]);
    console.log('✅ Sample products created');
  } else {
    console.log('ℹ️  Products already exist, skipping');
  }

  await mongoose.disconnect();
  console.log('Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
