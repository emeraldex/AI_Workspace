-- File: docker/postgres/init.sql
-- Purpose: Run once on first container start — enables extensions and creates FTS + vector indexes
-- Note: Prisma migrations handle table creation; this file handles extensions and raw SQL indexes

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
