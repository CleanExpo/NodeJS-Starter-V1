-- =============================================================================
-- DEV SEED DATA — LOCAL DEVELOPMENT ONLY
-- =============================================================================
-- WARNING: NEVER run this file in staging or production environments.
-- This file is executed automatically by docker-compose.yml for local dev.
--
-- Default credentials:  admin@local.dev / admin123
-- These are well-known and must NOT be used in any real environment.
-- =============================================================================

-- Default admin user for local development
-- Password: "admin123" (bcrypt hash — cost factor 12)
INSERT INTO users (email, password_hash, full_name, is_admin)
VALUES (
    'admin@local.dev',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y7R.PZCjJxWe',
    'System Administrator',
    TRUE
)
ON CONFLICT (email) DO NOTHING;
