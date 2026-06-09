import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gadtech.com' },
    update: {},
    create: {
      email: 'admin@gadtech.com',
      firstName: 'Admin',
      lastName: 'GadTech',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ─── Brands ──────────────────────────────────────────────────────────────────
  const brandData = [
    { name: 'Samsung', slug: 'samsung' },
    { name: 'LG', slug: 'lg' },
    { name: 'HP', slug: 'hp' },
    { name: 'Dell', slug: 'dell' },
    { name: 'Lenovo', slug: 'lenovo' },
    { name: 'Apple', slug: 'apple' },
    { name: 'Huawei', slug: 'huawei' },
    { name: 'Tecno', slug: 'tecno' },
    { name: 'Hisense', slug: 'hisense' },
    { name: 'Sony', slug: 'sony' },
  ];

  for (const brand of brandData) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }
  console.log(`✅ ${brandData.length} brands created`);

  // ─── Categories ───────────────────────────────────────────────────────────────
  const laptopsCategory = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: { name: 'Laptops', slug: 'laptops', sortOrder: 1 },
  });

  const phonesCategory = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: { name: 'Smartphones', slug: 'smartphones', sortOrder: 2 },
  });

  const tvCategory = await prisma.category.upsert({
    where: { slug: 'televisions' },
    update: {},
    create: { name: 'Televisions', slug: 'televisions', sortOrder: 3 },
  });

  const appliancesCategory = await prisma.category.upsert({
    where: { slug: 'home-appliances' },
    update: {},
    create: { name: 'Home Appliances', slug: 'home-appliances', sortOrder: 4 },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories', sortOrder: 5 },
  });

  await prisma.category.upsert({
    where: { slug: 'printers' },
    update: {},
    create: { name: 'Printers', slug: 'printers', sortOrder: 6 },
  });

  console.log('✅ Categories created');

  // ─── Banners ─────────────────────────────────────────────────────────────────
  await prisma.banner.upsert({
    where: { id: 'seed-banner-1' },
    update: {},
    create: {
      id: 'seed-banner-1',
      title: 'New Season Deals',
      subtitle: 'Up to 40% off on Laptops & TVs',
      image: 'https://placehold.co/1200x500/1a1a2e/ffffff?text=New+Season+Deals',
      buttonText: 'Shop Now',
      link: '/products',
      position: 'HERO',
      sortOrder: 1,
    },
  });

  await prisma.banner.upsert({
    where: { id: 'seed-banner-2' },
    update: {},
    create: {
      id: 'seed-banner-2',
      title: 'Latest Smartphones',
      subtitle: 'Samsung, Apple, Huawei & More',
      image: 'https://placehold.co/1200x500/0f3460/ffffff?text=Latest+Smartphones',
      buttonText: 'Explore',
      link: '/products?categoryId=smartphones',
      position: 'HERO',
      sortOrder: 2,
    },
  });
  console.log('✅ Banners created');

  // ─── Coupon ───────────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off your first order',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxUses: 1000,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE50' },
    update: {},
    create: {
      code: 'SAVE50',
      description: 'GHS 50 off orders above GHS 500',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderValue: 500,
      maxUses: 500,
      isActive: true,
    },
  });
  console.log('✅ Coupons created');

  console.log('\n🎉 Seeding complete!');
  console.log('📧 Admin login: admin@gadtech.com');
  console.log('🔑 Admin password: Admin@1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
