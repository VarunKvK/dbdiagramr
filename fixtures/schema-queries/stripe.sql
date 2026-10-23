insert into customers (id, email, created) values
  ('cus_1', 'alice@example.com', now());

insert into products (id, name, created) values
  ('prod_1', 'Pro plan', now());

insert into prices (id, product_id, unit_amount, currency, recurring_interval, created) values
  ('price_1', 'prod_1', 1000, 'usd', 'month', now());

insert into subscriptions (id, customer_id, status, current_period_start, current_period_end, cancel_at_period_end, created) values
  ('sub_1', 'cus_1', 'active', now(), now() + interval '1 month', true, now());

insert into subscription_items (id, subscription_id, price_id, quantity, created) values
  ('si_1', 'sub_1', 'price_1', 2, now());

insert into invoices (id, customer_id, status, amount_due, currency, created) values
  ('in_1', 'cus_1', 'open', 1500, 'usd', now());

insert into payment_intents (id, customer_id, amount, currency, status, created) values
  ('pi_1', 'cus_1', 1500, 'usd', 'requires_payment_method', now());
