-- Verify industrialiasi-db-migrations:idstschema on pg
BEGIN;

-- XXX Add verifications here.
SELECT
  EXISTS (
    SELECT
      1
    FROM
      pg_namespace
    WHERE
      nspname = 'idst'
  ) ROLLBACK;