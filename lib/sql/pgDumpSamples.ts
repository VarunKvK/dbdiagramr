export const ECOMMERCE_SQL = `-- E-commerce example (5 tables, copy-paste friendly)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  title varchar(255) NOT NULL,
  body text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE
);

CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id),
  user_id uuid NOT NULL REFERENCES users(id),
  content text NOT NULL
);

CREATE TABLE post_tags (
  post_id uuid NOT NULL REFERENCES posts(id),
  tag_id uuid NOT NULL REFERENCES tags(id),
  PRIMARY KEY (post_id, tag_id)
);
`.trim();

export const SUPABASE_SQL = `-- Supabase auth schema (7 tables)
CREATE TABLE users (
  id uuid PRIMARY KEY,
  instance_id uuid,
  aud varchar(255),
  role varchar(255),
  email varchar(255),
  encrypted_password varchar(255),
  email_confirmed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  is_super_admin boolean
);

CREATE TABLE identities (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  provider_id text,
  identity_data jsonb,
  provider text NOT NULL
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz,
  factor_id uuid,
  aal text
);

CREATE TABLE refresh_tokens (
  id bigserial PRIMARY KEY,
  token varchar(255),
  user_id uuid REFERENCES users(id),
  parent varchar(255),
  session_id uuid REFERENCES sessions(id)
);

CREATE TABLE instances (
  id uuid PRIMARY KEY,
  uuid uuid,
  raw_base_config text
);

CREATE TABLE audit_log_entries (
  id uuid PRIMARY KEY,
  instance_id uuid,
  payload json,
  ip_address varchar(64)
);

CREATE TABLE schema_migrations (
  version varchar(255) PRIMARY KEY
);
`.trim();

export const NEXTAUTH_SQL = `-- NextAuth.js / Auth.js schema (4 tables)
CREATE TABLE users (
  id text PRIMARY KEY,
  name text,
  email text,
  "emailVerified" timestamptz,
  image text
);

CREATE TABLE accounts (
  id text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES users(id),
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text
);

CREATE TABLE sessions (
  id text PRIMARY KEY,
  "sessionToken" text NOT NULL UNIQUE,
  "userId" text NOT NULL REFERENCES users(id),
  expires timestamptz NOT NULL
);

CREATE TABLE verification_tokens (
  identifier text NOT NULL,
  token text NOT NULL,
  expires timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);
`.trim();

export const SIMPLE_SQL = `-- Minimal 2-table example to test live parsing
CREATE TABLE authors (
  id serial PRIMARY KEY,
  name varchar(100) NOT NULL
);

CREATE TABLE books (
  id serial PRIMARY KEY,
  author_id integer NOT NULL REFERENCES authors(id),
  title varchar(200) NOT NULL
);
`.trim();

export const BLOG_SQL = `-- Blog platform schema (5 tables)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(50) NOT NULL UNIQUE,
  email varchar(255) NOT NULL UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE categories (
  id serial PRIMARY KEY,
  name varchar(100) NOT NULL UNIQUE,
  slug varchar(100) NOT NULL UNIQUE
);

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id),
  category_id integer REFERENCES categories(id),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  content text NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id),
  user_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE likes (
  user_id uuid NOT NULL REFERENCES users(id),
  post_id uuid NOT NULL REFERENCES posts(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
`.trim();
