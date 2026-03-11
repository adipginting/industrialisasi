-- Revert industrialiasi-db-migrations:initialtables from pg
BEGIN;

-- XXX Add DDLs here.

DROP TABLE idst.comments;

DROP TABLE idst.posts;

DROP TABLE idst.sessions;

DROP TABLE idst.codes;

DROP TABLE idst.users;

COMMIT;