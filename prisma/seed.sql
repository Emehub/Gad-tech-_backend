-- ============================================================
-- GadTech E-Commerce — Seed Data
-- Run this in Supabase SQL Editor after running schema.sql
-- ============================================================

-- Admin User (password: Admin@1234)
INSERT INTO "users" ("id","email","firstName","lastName","password","role","isEmailVerified","isActive","updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@gadtech.com',
  'Admin',
  'GadTech',
  '$2a$12$DDwK6VPMtELs9Zjimlatbe9L//XL.QQRTpLrq6DXPg/3TyXjw87EK',
  'SUPER_ADMIN',
  true,
  true,
  NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Brands
INSERT INTO "brands" ("id","name","slug","isActive","updatedAt") VALUES
  (gen_random_uuid()::text, 'Samsung',  'samsung',  true, NOW()),
  (gen_random_uuid()::text, 'LG',       'lg',       true, NOW()),
  (gen_random_uuid()::text, 'HP',       'hp',       true, NOW()),
  (gen_random_uuid()::text, 'Dell',     'dell',     true, NOW()),
  (gen_random_uuid()::text, 'Lenovo',   'lenovo',   true, NOW()),
  (gen_random_uuid()::text, 'Apple',    'apple',    true, NOW()),
  (gen_random_uuid()::text, 'Huawei',   'huawei',   true, NOW()),
  (gen_random_uuid()::text, 'Tecno',    'tecno',    true, NOW()),
  (gen_random_uuid()::text, 'Hisense',  'hisense',  true, NOW()),
  (gen_random_uuid()::text, 'Sony',     'sony',     true, NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Categories
INSERT INTO "categories" ("id","name","slug","isActive","sortOrder","updatedAt") VALUES
  (gen_random_uuid()::text, 'Laptops',          'laptops',          true, 1, NOW()),
  (gen_random_uuid()::text, 'Smartphones',      'smartphones',      true, 2, NOW()),
  (gen_random_uuid()::text, 'Televisions',      'televisions',      true, 3, NOW()),
  (gen_random_uuid()::text, 'Home Appliances',  'home-appliances',  true, 4, NOW()),
  (gen_random_uuid()::text, 'Accessories',      'accessories',      true, 5, NOW()),
  (gen_random_uuid()::text, 'Printers',         'printers',         true, 6, NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Banners
INSERT INTO "banners" ("id","title","subtitle","image","buttonText","link","position","isActive","sortOrder","updatedAt") VALUES
  (
    'seed-banner-1',
    'New Season Deals',
    'Up to 40% off on Laptops & TVs',
    'https://placehold.co/1200x500/1a1a2e/ffffff?text=New+Season+Deals',
    'Shop Now',
    '/products',
    'HERO',
    true,
    1,
    NOW()
  ),
  (
    'seed-banner-2',
    'Latest Smartphones',
    'Samsung, Apple, Huawei & More',
    'https://placehold.co/1200x500/0f3460/ffffff?text=Latest+Smartphones',
    'Explore',
    '/products?categoryId=smartphones',
    'HERO',
    true,
    2,
    NOW()
  )
ON CONFLICT ("id") DO NOTHING;

-- Coupons
INSERT INTO "coupons" ("id","code","description","discountType","discountValue","minOrderValue","maxUses","isActive","updatedAt") VALUES
  (
    gen_random_uuid()::text,
    'WELCOME10',
    '10% off your first order',
    'PERCENTAGE',
    10,
    NULL,
    1000,
    true,
    NOW()
  ),
  (
    gen_random_uuid()::text,
    'SAVE50',
    'GHS 50 off orders above GHS 500',
    'FIXED',
    50,
    500,
    500,
    true,
    NOW()
  )
ON CONFLICT ("code") DO NOTHING;
