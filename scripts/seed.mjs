import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales en SQL Server para Bohoart Jewelry...');

  // 1. Admin user
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios (sin valores por defecto).');
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administradora Bohoart',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      phone: '+34 600 000 000',
    },
  });
  console.log(`👤 Usuario Admin creado/verificado: ${admin.email}`);

  // 2. Settings
  await prisma.storeSetting.upsert({
    where: { id: 'store-default' },
    update: {},
    create: {
      id: 'store-default',
      storeName: 'Bohoart Jewelry',
      announcementText: '✨ Envíos gratis a toda España en pedidos a partir de 40€ | Joyas hechas a mano con amor ✨',
      freeShippingThreshold: 40.0,
      standardShippingCost: 3.95,
      contactEmail: 'hola@bohoartjoyeria.com',
      instagramUrl: 'https://instagram.com/bohoart.jewelry',
      bizumPhone: '+34 610 97 72 77',
      paypalMeUrl: 'https://www.paypal.me/rcarreterohernandez',
    },
  });
  // Fix databases created with the old (wrong) default Instagram URL, without touching custom values.
  await prisma.storeSetting.updateMany({
    where: { instagramUrl: 'https://instagram.com/bohoartjewelry' },
    data: { instagramUrl: 'https://instagram.com/bohoart.jewelry' },
  });
  await prisma.storeSetting.updateMany({
    where: { id: 'store-default', bizumPhone: null },
    data: { bizumPhone: '+34 610 97 72 77' },
  });
  await prisma.storeSetting.updateMany({
    where: { id: 'store-default', paypalMeUrl: null },
    data: { paypalMeUrl: 'https://www.paypal.me/rcarreterohernandez' },
  });
  console.log('⚙️ Configuración de la tienda lista.');

  // 3. Categories
  const categories = [
    {
      id: 'cat-pendientes',
      name: 'Pendientes de Arcilla',
      slug: 'pendientes',
      description: 'Pendientes artesanales ultraligeros hechos a mano con arcilla polimérica.',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
      sortOrder: 1,
    },
    {
      id: 'cat-pulseras',
      name: 'Pulseras & Brazaletes',
      slug: 'pulseras',
      description: 'Brazaletes con cuentas modeladas a mano con detalles dorados.',
      image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
      sortOrder: 2,
    },
    {
      id: 'cat-collares',
      name: 'Collares & Colgantes',
      slug: 'collares',
      description: 'Colgantes botánicos y medallones con texturas en arcilla y pan de oro.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      sortOrder: 3,
    },
    {
      id: 'cat-anillos',
      name: 'Anillos Esculpidos',
      slug: 'anillos',
      description: 'Anillos llamativos y minimalistas con gemas de arcilla.',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
      sortOrder: 4,
    },
    {
      id: 'cat-colecciones',
      name: 'Colecciones Especiales',
      slug: 'colecciones',
      description: 'Packs de regalo y ediciones limitadas con packaging artesanal.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      sortOrder: 5,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {}, // never overwrite edits made from the admin panel
      create: cat,
    });
  }
  console.log(`📦 ${categories.length} categorías creadas/verificadas.`);

  console.log('✅ Base de datos inicializada con éxito.');
}

main()
  .catch((e) => {
    console.error('Error sembrando datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
