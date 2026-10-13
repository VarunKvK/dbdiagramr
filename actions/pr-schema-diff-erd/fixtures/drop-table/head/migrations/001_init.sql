CREATE TABLE users (
  id serial PRIMARY KEY
);

CREATE TABLE order_items (
  id serial PRIMARY KEY,
  order_id integer REFERENCES legacy_orders (id),
  sku text
);
