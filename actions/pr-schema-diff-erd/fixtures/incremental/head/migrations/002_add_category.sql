ALTER TABLE products ADD COLUMN category_id integer;

CREATE TABLE categories (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE
);

ALTER TABLE products
  ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category_id) REFERENCES categories (id);
