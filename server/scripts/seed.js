import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import { loadServerEnv, resolveMongoConnection } from '../config/env.js';

loadServerEnv();

const seed = async () => {
  // Optional: SEED_ENV=production | preview | testing | development
  if (process.env.SEED_ENV) {
    process.env.APP_ENV = process.env.SEED_ENV;
  }

  const { uri, label } = resolveMongoConnection();
  await mongoose.connect(uri);
  console.log(`MongoDB connected for seeding (${label})...`);

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

  // Default services
  const servicesCount = await Service.countDocuments();
  if (servicesCount === 0) {
    await Service.insertMany([
      {
        title: 'Piscinas de obra', tag: 'Construcción', tone: 'sun', variant: 'solid', order: 0,
        description: 'Proyecto a medida en hormigón gunitado: del estudio del terreno al revestimiento final. Formas libres, infinity, desbordante o skimmer.',
        bullets: ['Estudio y diseño 3D', 'Hormigón gunitado', 'Revestimiento gresite o microcemento'],
      },
      {
        title: 'Reformas', tag: 'Renovación', tone: 'teal', variant: 'soft', order: 1,
        description: 'Devolvemos la vida a tu piscina: cambio de vaso, coronación, iluminación LED y modernización de la depuración.',
        bullets: ['Nuevo revestimiento', 'Iluminación LED', 'Depuración eficiente'],
      },
      {
        title: 'Climatización', tag: 'Confort', tone: 'sun', variant: 'solid', order: 2,
        description: 'Bombas de calor, cubiertas y cobertores para disfrutar de tu piscina muchos más meses al año, con bajo consumo.',
        bullets: ['Bomba de calor inverter', 'Cubierta automática', 'Manta térmica'],
      },
      {
        title: 'Cercos y seguridad', tag: 'Seguridad', tone: 'teal', variant: 'soft', order: 3,
        description: 'Protegemos lo que más querés: cercos removibles y fijos alrededor de tu piscina para mayor tranquilidad con niños y mascotas.',
        bullets: ['Cercos removibles y fijos', 'Materiales de alta resistencia', 'Instalación profesional'],
      },
    ]);
    console.log('✅ Default services created');
  } else {
    console.log('ℹ️  Services already exist, skipping');
  }

  await mongoose.disconnect();
  console.log('Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
