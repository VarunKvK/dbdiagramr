insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt") values
  ('user-1', 'Alice', 'alice@example.com', true, now(), now());

insert into session (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt") values
  ('session-1', 'user-1', 'token-1', now() + interval '1 day', '127.0.0.1', 'test', now(), now());

insert into account (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt") values
  ('account-1', 'user-1', 'google-1', 'google', null, now(), now()),
  ('account-2', 'user-1', 'credential-1', 'credential', 'hash', now(), now());

insert into verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") values
  ('verification-1', 'alice@example.com', 'code-1', now() + interval '1 hour', now(), now());
