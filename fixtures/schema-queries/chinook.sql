insert into artist (artist_id, name) values
  (1, 'The Testers');

insert into album (album_id, title, artist_id) values
  (1, 'First Album', 1);

insert into genre (genre_id, name) values
  (1, 'Rock');

insert into media_type (media_type_id, name) values
  (1, 'MPEG audio');

insert into employee (employee_id, last_name, first_name) values
  (1, 'Rep', 'Rita');

insert into customer (customer_id, first_name, last_name, email, country, support_rep_id) values
  (1, 'Alice', 'Customer', 'alice@example.com', 'USA', 1);

insert into track (track_id, name, album_id, media_type_id, genre_id, milliseconds, unit_price) values
  (1, 'Test Track', 1, 1, 1, 180000, 0.99);

insert into invoice (invoice_id, customer_id, invoice_date, total) values
  (1, 1, now(), 1.98);

insert into invoice_line (invoice_line_id, invoice_id, track_id, unit_price, quantity) values
  (1, 1, 1, 0.99, 2);

insert into playlist (playlist_id, name) values
  (1, 'Road Trip');

insert into playlist_track (playlist_id, track_id) values
  (1, 1);
