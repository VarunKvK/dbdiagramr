CREATE TABLE users (
  id serial PRIMARY KEY,
  email text UNIQUE
);

CREATE TABLE legacy_orders (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users (id),
  amount numeric(10,2)
);

CREATE TABLE order_items (
  id serial PRIMARY KEY,
  order_id integer REFERENCES legacy_orders (id),
  sku text
);
