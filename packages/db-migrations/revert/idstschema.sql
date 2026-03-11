-- Revert industrialiasi-db-migrations:idstschema from pg

BEGIN;

-- XXX Add DDLs here.
DROP SCHEMA idst;

COMMIT;
