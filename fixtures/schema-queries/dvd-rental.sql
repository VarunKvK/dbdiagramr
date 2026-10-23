set session_replication_role = replica;

insert into country (country_id, country) values
  (1, 'United States');

insert into city (city_id, city, country_id) values
  (1, 'Springfield', 1);

insert into address (address_id, address, district, city_id, phone) values
  (1, '1 Main St', 'District', 1, '555-0100');

insert into store (store_id, manager_staff_id, address_id) values
  (1, 1, 1);

insert into staff (staff_id, first_name, last_name, address_id, store_id, username) values
  (1, 'Sam', 'Staff', 1, 1, 'sam');

insert into customer (customer_id, store_id, first_name, last_name, address_id) values
  (1, 1, 'Alice', 'Customer', 1);

insert into language (language_id, name) values
  (1, 'English');

insert into actor (actor_id, first_name, last_name) values
  (1, 'Ada', 'Actor');

insert into category (category_id, name) values
  (1, 'Action');

insert into film (film_id, title, release_year, language_id, fulltext) values
  (1, 'Test Film', 2020, 1, to_tsvector('simple', 'test film'));

insert into film_actor (actor_id, film_id) values
  (1, 1);

insert into film_category (film_id, category_id) values
  (1, 1);

insert into inventory (inventory_id, film_id, store_id) values
  (1, 1, 1);

insert into rental (rental_id, rental_date, inventory_id, customer_id, return_date, staff_id) values
  (1, now() - interval '10 days', 1, 1, null, 1);

insert into payment (payment_id, customer_id, staff_id, rental_id, amount, payment_date) values
  (1, 1, 1, 1, 4.99, now());

set session_replication_role = origin;
