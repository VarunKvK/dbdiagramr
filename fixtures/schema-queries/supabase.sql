insert into users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'alice@example.com'),
  ('00000000-0000-0000-0000-000000000009', 'no-identity@example.com');

insert into identities (provider_id, user_id, identity_data, provider) values
  ('google-1', '00000000-0000-0000-0000-000000000001', '{}'::jsonb, 'google');

insert into sessions (id, user_id, created_at, not_after, aal, scopes) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', now(), now() + interval '1 day', 'aal1', 'openid');

insert into refresh_tokens (id, token, user_id, revoked, created_at, session_id) values
  (1, 'refresh-1', '00000000-0000-0000-0000-000000000001', false, now(), '00000000-0000-0000-0000-000000000010');
