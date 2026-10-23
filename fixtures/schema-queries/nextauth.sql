insert into users (id, name, email) values
  (1, 'Alice', 'alice@example.com'),
  (2, 'Bob', 'bob@example.com');

insert into accounts (id, "userId", type, provider, "providerAccountId") values
  (1, 1, 'oauth', 'google', 'google-1');

insert into sessions (id, "userId", expires, "sessionToken") values
  (1, 1, now() + interval '10 days', 'session-token-1');
