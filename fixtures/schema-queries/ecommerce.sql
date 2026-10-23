insert into customers (id, email, created_at) values
  ('00000000-0000-0000-0000-000000000001', 'alice@example.com', now());

insert into categories (id, name, slug, created_at) values
  ('00000000-0000-0000-0000-000000000002', 'Gadgets', 'gadgets', now());

insert into products (id, title, slug, category_id, price_cents, created_at) values
  ('00000000-0000-0000-0000-000000000003', 'Widget', 'widget', '00000000-0000-0000-0000-000000000002', 1500, now());

insert into carts (id, customer_id, status, created_at) values
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'active', now());

insert into cart_items (id, cart_id, product_id, quantity, unit_price_cents, added_at) values
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 2, 1500, now());

insert into orders (id, customer_id, status, total_cents, placed_at) values
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'paid', 3000, now()),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'pending', 1500, now());

insert into order_items (id, order_id, product_id, product_title, quantity, unit_price_cents, total_cents, created_at) values
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'Widget', 2, 1500, 3000, now());

insert into payments (id, order_id, amount_cents, currency, status, created_at) values
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000006', 3000, 'USD', 'succeeded', now());
