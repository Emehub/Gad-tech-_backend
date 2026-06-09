-- ============================================================
-- GadTech Store — Sample Product Seed
-- Run this in Supabase SQL Editor after schema.sql + seed.sql
-- ============================================================

-- Laptops
INSERT INTO "Product" (id, name, slug, description, price, "comparePrice", cost, sku, stock, "lowStockThreshold", "categoryId", "brandId", status, "isFeatured", "isNewArrival", "isBestSeller", rating, "reviewCount", "soldCount", "viewCount", tags, "seoTitle", "seoDescription", "createdAt", "updatedAt")
VALUES
(
  gen_random_uuid()::text, 'HP Pavilion 15 Core i5 11th Gen', 'hp-pavilion-15-core-i5-11th-gen',
  'The HP Pavilion 15 delivers everyday performance with Intel Core i5 11th Gen, 8GB RAM, 512GB SSD and a 15.6" Full HD display. Ideal for students and professionals.',
  3499.00, 3999.00, 2700.00, 'HP-PAV15-I5-8G', 15, 3,
  (SELECT id FROM "Category" WHERE name = 'Laptops' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'HP' LIMIT 1),
  'PUBLISHED', true, false, true, 4.5, 18, 42, 320,
  ARRAY['laptop','hp','intel','core i5','windows 11','student laptop'], 'HP Pavilion 15 Core i5 | GadTech', 'Buy HP Pavilion 15 laptop in Ghana. Intel Core i5, 8GB RAM, 512GB SSD.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Dell Inspiron 15 3000 Core i3', 'dell-inspiron-15-3000-core-i3',
  'Affordable and reliable, the Dell Inspiron 15 3000 features Intel Core i3, 4GB RAM, 256GB SSD. Great entry-level laptop for everyday tasks.',
  2800.00, 3200.00, 2100.00, 'DELL-INS15-I3-4G', 12, 3,
  (SELECT id FROM "Category" WHERE name = 'Laptops' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Dell' LIMIT 1),
  'PUBLISHED', false, true, false, 4.2, 9, 21, 180,
  ARRAY['laptop','dell','intel','core i3','affordable','windows 11'], 'Dell Inspiron 15 3000 | GadTech', 'Buy Dell Inspiron 15 laptop in Ghana. Budget-friendly with Intel Core i3.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Lenovo IdeaPad 3 Core i5 12th Gen', 'lenovo-ideapad-3-core-i5-12th-gen',
  'Lenovo IdeaPad 3 with Intel Core i5 12th Gen, 8GB RAM, 512GB SSD, 15.6" FHD display. Slim design with all-day battery life.',
  3800.00, 4500.00, 3000.00, 'LEN-IDP3-I5-8G', 8, 2,
  (SELECT id FROM "Category" WHERE name = 'Laptops' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Lenovo' LIMIT 1),
  'PUBLISHED', false, true, false, 4.3, 7, 18, 145,
  ARRAY['laptop','lenovo','ideapad','intel','core i5','windows 11'], 'Lenovo IdeaPad 3 Core i5 | GadTech', 'Buy Lenovo IdeaPad 3 in Ghana. 12th Gen Intel, 8GB RAM, slim design.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Apple MacBook Air M2 8GB 256GB', 'apple-macbook-air-m2-8gb-256gb',
  'The Apple MacBook Air M2 features the powerful Apple M2 chip, 8GB unified memory, 256GB SSD. Fanless design, up to 18 hours battery. Stunning Liquid Retina display.',
  7999.00, 8500.00, 6500.00, 'APL-MBA-M2-8G', 5, 2,
  (SELECT id FROM "Category" WHERE name = 'Laptops' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Apple' LIMIT 1),
  'PUBLISHED', true, true, true, 4.9, 31, 58, 620,
  ARRAY['laptop','apple','macbook','m2','macos','premium'], 'Apple MacBook Air M2 | GadTech', 'Buy Apple MacBook Air M2 in Ghana. Powerful M2 chip, Liquid Retina display.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Asus VivoBook 15 Core i5 AMD Ryzen 5', 'asus-vivobook-15-ryzen-5',
  'Asus VivoBook 15 with AMD Ryzen 5, 8GB RAM, 512GB SSD, 15.6" FHD display. Lightweight at 1.8kg with ErgoLift hinge design.',
  3200.00, 3700.00, 2500.00, 'ASUS-VB15-R5-8G', 10, 3,
  (SELECT id FROM "Category" WHERE name = 'Laptops' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Asus' LIMIT 1),
  'PUBLISHED', false, false, false, 4.1, 6, 14, 112,
  ARRAY['laptop','asus','vivobook','amd','ryzen','windows 11'], 'Asus VivoBook 15 AMD Ryzen 5 | GadTech', 'Buy Asus VivoBook 15 in Ghana. AMD Ryzen 5, lightweight design.',
  NOW(), NOW()
),

-- Smartphones
(
  gen_random_uuid()::text, 'Samsung Galaxy A54 5G 128GB', 'samsung-galaxy-a54-5g-128gb',
  'Samsung Galaxy A54 5G with 6.4" Super AMOLED display, 50MP main camera, 5000mAh battery, 8GB RAM, 128GB storage. Water resistant IP67.',
  2799.00, 3200.00, 2100.00, 'SAM-A54-5G-128', 20, 5,
  (SELECT id FROM "Category" WHERE name = 'Smartphones' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Samsung' LIMIT 1),
  'PUBLISHED', true, false, true, 4.6, 44, 87, 780,
  ARRAY['smartphone','samsung','galaxy','5g','android','amoled'], 'Samsung Galaxy A54 5G | GadTech', 'Buy Samsung Galaxy A54 5G in Ghana. Super AMOLED, 50MP camera.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'iPhone 15 128GB', 'iphone-15-128gb',
  'Apple iPhone 15 with 6.1" Super Retina XDR display, A16 Bionic chip, 48MP camera, USB-C, Dynamic Island. Available in multiple colours.',
  6499.00, 7000.00, 5500.00, 'APL-IP15-128', 8, 2,
  (SELECT id FROM "Category" WHERE name = 'Smartphones' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Apple' LIMIT 1),
  'PUBLISHED', true, true, true, 4.8, 62, 105, 1200,
  ARRAY['smartphone','apple','iphone','ios','5g','usb-c','premium'], 'Apple iPhone 15 128GB | GadTech', 'Buy iPhone 15 in Ghana. A16 Bionic, 48MP camera, USB-C.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Samsung Galaxy S23 256GB', 'samsung-galaxy-s23-256gb',
  'Samsung Galaxy S23 flagship with 6.1" Dynamic AMOLED, Snapdragon 8 Gen 2, 50MP triple camera, 3900mAh battery, IP68 water resistance.',
  5200.00, 5800.00, 4200.00, 'SAM-S23-256', 6, 2,
  (SELECT id FROM "Category" WHERE name = 'Smartphones' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Samsung' LIMIT 1),
  'PUBLISHED', true, false, true, 4.7, 38, 72, 650,
  ARRAY['smartphone','samsung','galaxy','flagship','snapdragon','5g'], 'Samsung Galaxy S23 256GB | GadTech', 'Buy Samsung Galaxy S23 in Ghana. Snapdragon 8 Gen 2 flagship.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Huawei Nova 11 Pro 256GB', 'huawei-nova-11-pro-256gb',
  'Huawei Nova 11 Pro with 6.78" OLED display, 100MP front camera, 60W fast charging, 8GB RAM, 256GB storage. Elegant curved design.',
  2199.00, 2599.00, 1700.00, 'HUA-NOV11P-256', 14, 3,
  (SELECT id FROM "Category" WHERE name = 'Smartphones' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Huawei' LIMIT 1),
  'PUBLISHED', false, true, false, 4.0, 11, 28, 210,
  ARRAY['smartphone','huawei','nova','oled','fast charging'], 'Huawei Nova 11 Pro | GadTech', 'Buy Huawei Nova 11 Pro in Ghana. 100MP selfie, OLED display.',
  NOW(), NOW()
),

-- Televisions
(
  gen_random_uuid()::text, 'LG 43" 4K UHD Smart TV', 'lg-43-inch-4k-uhd-smart-tv',
  'LG 43-inch 4K UHD Smart TV with WebOS, ThinQ AI, HDR10, Dolby Vision, built-in Google Assistant and Alexa. Sleek bezel-less design.',
  2499.00, 2999.00, 1900.00, 'LG-43-4K-UHD', 12, 3,
  (SELECT id FROM "Category" WHERE name = 'Televisions' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'LG' LIMIT 1),
  'PUBLISHED', true, false, true, 4.5, 25, 54, 430,
  ARRAY['tv','television','lg','4k','smart tv','webos','uhd'], 'LG 43 inch 4K Smart TV | GadTech', 'Buy LG 43 inch 4K UHD Smart TV in Ghana. WebOS, ThinQ AI.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Samsung 50" Crystal 4K UHD Smart TV', 'samsung-50-crystal-4k-smart-tv',
  'Samsung 50-inch Crystal 4K UHD Smart TV with Tizen OS, HDR, PurColor technology, built-in Alexa, Q-Symphony audio, Apple AirPlay 2.',
  3799.00, 4200.00, 2900.00, 'SAM-50-CRY4K', 9, 2,
  (SELECT id FROM "Category" WHERE name = 'Televisions' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Samsung' LIMIT 1),
  'PUBLISHED', true, false, false, 4.4, 19, 38, 360,
  ARRAY['tv','television','samsung','4k','crystal uhd','smart tv','tizen'], 'Samsung 50 inch Crystal 4K TV | GadTech', 'Buy Samsung 50 inch 4K Smart TV in Ghana. Crystal UHD, Tizen OS.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Hisense 55" QLED 4K Smart TV', 'hisense-55-qled-4k-smart-tv',
  'Hisense 55-inch QLED 4K Smart TV with VIDAA OS, Quantum Dot colour, Dolby Vision & Atmos, Game Mode Plus, HDMI 2.1. Crystal clear picture.',
  4199.00, 4799.00, 3200.00, 'HIS-55-QLED4K', 7, 2,
  (SELECT id FROM "Category" WHERE name = 'Televisions' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Hisense' LIMIT 1),
  'PUBLISHED', false, true, false, 4.3, 14, 29, 280,
  ARRAY['tv','television','hisense','qled','4k','smart tv','dolby'], 'Hisense 55 inch QLED 4K TV | GadTech', 'Buy Hisense 55 inch QLED 4K Smart TV in Ghana. Quantum Dot, Dolby Vision.',
  NOW(), NOW()
),

-- Audio
(
  gen_random_uuid()::text, 'Sony WH-1000XM5 Wireless Headphones', 'sony-wh-1000xm5-wireless-headphones',
  'Sony WH-1000XM5 industry-leading noise cancelling headphones with 30-hour battery, multipoint connection, crystal clear hands-free calls, and premium audio quality.',
  1799.00, 2200.00, 1300.00, 'SNY-WH1000XM5', 18, 4,
  (SELECT id FROM "Category" WHERE name = 'Audio & Sound' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Sony' LIMIT 1),
  'PUBLISHED', true, false, true, 4.8, 53, 94, 820,
  ARRAY['headphones','sony','wireless','noise cancelling','bluetooth','audio'], 'Sony WH-1000XM5 Headphones | GadTech', 'Buy Sony WH-1000XM5 in Ghana. Industry-leading noise cancellation.',
  NOW(), NOW()
),
(
  gen_random_uuid()::text, 'Samsung Galaxy Buds2 Pro', 'samsung-galaxy-buds2-pro',
  'Samsung Galaxy Buds2 Pro with ANC, Hi-Fi 24-bit audio, ergonomic fit, IPX7 water resistance, 8-hour playback, 360 Audio. Works seamlessly with Galaxy devices.',
  899.00, 1100.00, 650.00, 'SAM-BUDS2PRO', 25, 5,
  (SELECT id FROM "Category" WHERE name = 'Audio & Sound' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Samsung' LIMIT 1),
  'PUBLISHED', false, false, true, 4.4, 29, 66, 540,
  ARRAY['earbuds','samsung','galaxy buds','wireless','anc','bluetooth'], 'Samsung Galaxy Buds2 Pro | GadTech', 'Buy Samsung Galaxy Buds2 Pro in Ghana. Hi-Fi audio, ANC.',
  NOW(), NOW()
),

-- Home Appliances
(
  gen_random_uuid()::text, 'LG 1.5HP Dual Inverter Split AC', 'lg-1-5hp-dual-inverter-split-ac',
  'LG 1.5HP Dual Inverter Split Air Conditioner with energy-saving inverter technology, auto-clean, Wi-Fi control, 4-star energy rating. Cooling capacity 12,000 BTU.',
  3199.00, 3700.00, 2400.00, 'LG-AC15HP-INV', 6, 2,
  (SELECT id FROM "Category" WHERE name = 'Home Appliances' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'LG' LIMIT 1),
  'PUBLISHED', false, false, false, 4.3, 8, 17, 195,
  ARRAY['air conditioner','ac','lg','inverter','cooling','split unit'], 'LG 1.5HP Dual Inverter AC | GadTech', 'Buy LG 1.5HP Dual Inverter Split AC in Ghana. Energy saving, Wi-Fi control.',
  NOW(), NOW()
),

-- Tablets
(
  gen_random_uuid()::text, 'Samsung Galaxy Tab A8 10.5" 64GB', 'samsung-galaxy-tab-a8-64gb',
  'Samsung Galaxy Tab A8 with 10.5" TFT display, Octa-core processor, 64GB storage, 4GB RAM, 7040mAh battery, quad speakers. Perfect for entertainment and work.',
  1899.00, 2200.00, 1400.00, 'SAM-TABA8-64G', 16, 4,
  (SELECT id FROM "Category" WHERE name = 'Tablets & iPads' LIMIT 1),
  (SELECT id FROM "Brand" WHERE name = 'Samsung' LIMIT 1),
  'PUBLISHED', false, true, false, 4.2, 16, 35, 290,
  ARRAY['tablet','samsung','galaxy tab','android','entertainment'], 'Samsung Galaxy Tab A8 10.5 inch | GadTech', 'Buy Samsung Galaxy Tab A8 in Ghana. 10.5 inch, 64GB storage.',
  NOW(), NOW()
);

-- ============================================================
-- Note: Product images should be uploaded via the Admin Panel
-- Go to /admin/products → Edit any product → Upload Images
-- ============================================================
