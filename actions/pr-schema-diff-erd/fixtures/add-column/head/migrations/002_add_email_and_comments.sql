ALTER TABLE users ADD COLUMN email text NOT NULL DEFAULT '';

CREATE TABLE comments (
  id serial PRIMARY KEY,
  post_id integer NOT NULL REFERENCES posts (id),
  author_id integer REFERENCES users (id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
