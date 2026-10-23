insert into categories (category_id, category_name) values
  (1, 'Beverages');

insert into customers (customer_id, company_name) values
  ('ALFKI', 'Alfreds Futterkiste');

insert into employees (employee_id, last_name, first_name) values
  (1, 'Sales', 'Sam');

insert into products (product_id, product_name, category_id, unit_price, units_in_stock, reorder_level, discontinued) values
  (1, 'Chai', 1, 18.00, 1, 5, 0);

insert into orders (order_id, customer_id, employee_id) values
  (1, 'ALFKI', 1);

insert into order_details (order_id, product_id, unit_price, quantity, discount) values
  (1, 1, 18.00, 2, 0);
