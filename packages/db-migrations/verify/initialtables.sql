-- Verify industrialiasi-db-migrations:initialtables on pg
BEGIN;

-- XXX Add verifications here.
SELECT
  table_name
FROM
  information_schema.tables
WHERE
  table_schema = 'idst'
  AND table_name IN ('users', 'sessions', 'codes', 'posts', 'codes');

ROLLBACK;