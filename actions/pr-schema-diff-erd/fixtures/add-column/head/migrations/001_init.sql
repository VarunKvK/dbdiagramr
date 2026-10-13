CREATE TABLE users (
  id serial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users (id),
  title text NOT NULL,
  body text
);
