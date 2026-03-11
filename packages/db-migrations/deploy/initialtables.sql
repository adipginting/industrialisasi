-- Deploy industrialiasi-db-migrations:initialtables to pg
-- requires: idstschema
BEGIN;

-- XXX Add DDLs here.
CREATE TABLE
  IF NOT EXISTS idst.users (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    username TEXT,
    email TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    can_post BOOLEAN DEFAULT FALSE
  );

CREATE TABLE
  IF NOT EXISTS idst.sessions (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES idst.users,
    session_token TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS idst.codes (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    saved_at TIMESTAMP NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS idst.posts (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES idst.users,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_at TIMESTAMP NOT NULL,
    edited_at TIMESTAMP NULL
  );

CREATE TABLE
  IF NOT EXISTS idst.comments (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES idst.users,
    post_id uuid NOT NULL REFERENCES idst.posts,
    comment TEXT NOT NULL,
    commented_at TIMESTAMP NOT NULL,
    edited_at TIMESTAMP
  );

COMMIT;