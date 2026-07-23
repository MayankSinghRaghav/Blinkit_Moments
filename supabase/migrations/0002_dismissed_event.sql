-- The adoption_events CHECK constraint predates the `dismissed` event, so
-- inserting one fails. Run this against an existing database; 0001_init.sql
-- already includes 'dismissed' for fresh installs.
alter table adoption_events drop constraint if exists adoption_events_event_check;

alter table adoption_events
  add constraint adoption_events_event_check
  check (event in ('suggested', 'tried', 'repeat', 'dismissed'));
