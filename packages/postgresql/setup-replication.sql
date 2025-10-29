/* Create a logical replication slot for the feed sync service */
SELECT pg_create_logical_replication_slot('slot1', 'pgoutput');

/* Create a publication to replicate changes in all tables */
CREATE PUBLICATION general FOR ALL TABLES;
