INSERT INTO products (sku, slug, name, category, description, price, image_url, attributes)
VALUES
  (
    'AER-FL-05',
    'fl-05',
    'FL-05',
    'Training Series',
    'Developed for high-intensity training sessions with durable flight characteristics.',
    1500,
    'https://images.unsplash.com/photo-1626225453014-49774309ba83?q=80&w=800&auto=format&fit=crop',
    '{"feathers":"Grade B Goose Feather","speed":"77/78","durability":"High","stability":"Consistent"}'::jsonb
  ),
  (
    'AER-FL-10',
    'fl-10',
    'FL-10',
    'Club Series',
    'Club-grade shuttlecock for competitive sessions with predictable flight path.',
    2000,
    'https://images.unsplash.com/photo-1613919113166-2990050bc83a?q=80&w=800&auto=format&fit=crop',
    '{"feathers":"Grade A Duck Feather","speed":"77/78","durability":"Professional","stability":"Elite"}'::jsonb
  ),
  (
    'AER-FL-15',
    'fl-15',
    'FL-15',
    'Tournament Series',
    'Premium tournament shuttlecock calibrated for national-level competitive use.',
    2500,
    'https://images.unsplash.com/photo-1599474924187-334a4ae593c0?q=80&w=800&auto=format&fit=crop',
    '{"feathers":"Grade A+ Goose Feather","speed":"77/78","durability":"Supreme","stability":"Perfect"}'::jsonb
  )
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (product_id, available_quantity, reserved_quantity, reorder_threshold)
SELECT id, 100, 0, 10
FROM products
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO coupons (code, discount_type, value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, is_active)
VALUES ('WELCOME10', 'percent', 10, 1000, 500, 500, 1, TRUE)
ON CONFLICT (code) DO NOTHING;
