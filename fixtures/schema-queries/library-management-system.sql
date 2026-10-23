insert into authors (id, first_name, last_name) values
  ('00000000-0000-0000-0000-000000000001', 'Ada', 'Lovelace');

insert into books (isbn, title) values
  ('9780000000001', 'Notes on the Analytical Engine');

insert into book_authors (isbn, author_id) values
  ('9780000000001', '00000000-0000-0000-0000-000000000001');

insert into copies (id, isbn) values
  ('00000000-0000-0000-0000-000000000002', '9780000000001');

insert into members (id, first_name, last_name, email, joined_at) values
  ('00000000-0000-0000-0000-000000000003', 'Grace', 'Hopper', 'grace@example.com', now());

insert into loans (id, copy_id, member_id, issued_at, due_at, returned_at) values
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', now() - interval '10 days', now() - interval '2 days', null);

insert into reservations (id, isbn, member_id, reserved_at, fulfilled_at) values
  ('00000000-0000-0000-0000-000000000005', '9780000000001', '00000000-0000-0000-0000-000000000003', now(), null);
