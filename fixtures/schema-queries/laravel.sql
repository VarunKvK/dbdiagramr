insert into users (id, name, email, password) values
  (1, 'Alice', 'alice@example.com', 'hash');

insert into sessions (id, user_id, payload, last_activity) values
  ('session-1', 1, '{}', 1700000000);

insert into jobs (id, queue, payload, attempts, available_at, created_at) values
  (1, 'default', '{}', 0, 1700000000, 1700000000);

insert into failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) values
  (1, 'failed-1', 'database', 'default', '{}', 'boom', now());

insert into cache (key, value, expiration) values
  ('cache-key', 'cache-value', 1800000000);
