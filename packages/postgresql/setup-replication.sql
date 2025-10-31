/* Create a logical replication slot for the feed sync service */
SELECT pg_create_logical_replication_slot('slot1', 'pgoutput');

/* Create a publication to replicate feed table insert operations */
CREATE PUBLICATION feed_pub FOR TABLE feed WITH (publish = 'insert');
