-- ============================================
-- AetherGuard Database Query File
-- Run queries by placing cursor on them
-- and pressing F5
-- ============================================


-- ─────────────────────────────────────────
-- 1. VIEW ALL USERS
-- ─────────────────────────────────────────
SELECT * FROM users;


-- ─────────────────────────────────────────
-- 2. VIEW ALL NOMINEES
-- ─────────────────────────────────────────
SELECT * FROM nominees;


-- ─────────────────────────────────────────
-- 3. VIEW ALL VAULT ITEMS (no encrypted content)
-- ─────────────────────────────────────────
SELECT id, user_id, item_type, title, original_filename,
       file_size, mime_type, created_at
FROM vault_items;


-- ─────────────────────────────────────────
-- 4. VIEW USERS WITH THEIR NOMINEE
-- ─────────────────────────────────────────
SELECT
    u.id         AS user_id,
    u.name       AS user_name,
    u.email      AS user_email,
    u.role,
    u.is_active,
    u.last_login,
    n.name       AS nominee_name,
    n.email      AS nominee_email,
    n.relationship,
    n.is_registered,
    n.access_status
FROM users u
LEFT JOIN nominees n ON u.id = n.user_id;


-- ─────────────────────────────────────────
-- 5. VIEW TABLE STRUCTURE — USERS
-- ─────────────────────────────────────────
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';


-- ─────────────────────────────────────────
-- 6. VIEW TABLE STRUCTURE — NOMINEES
-- ─────────────────────────────────────────
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'nominees';


-- ─────────────────────────────────────────
-- 7. VIEW TABLE STRUCTURE — VAULT ITEMS
-- ─────────────────────────────────────────
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vault_items';


-- ─────────────────────────────────────────
-- 8. COUNT RECORDS IN EACH TABLE
-- ─────────────────────────────────────────
SELECT 'users'       AS table_name, COUNT(*) AS total FROM users
UNION ALL
SELECT 'nominees'    AS table_name, COUNT(*) AS total FROM nominees
UNION ALL
SELECT 'vault_items' AS table_name, COUNT(*) AS total FROM vault_items;


-- ─────────────────────────────────────────
-- 9. VIEW ACTIVE USERS ONLY
-- ─────────────────────────────────────────
SELECT id, name, email, role, is_active,
       is_vault_locked, last_login, created_at
FROM users
WHERE is_active = true;


-- ─────────────────────────────────────────
-- 10. VIEW NOMINEE ACCESS REQUESTS
-- ─────────────────────────────────────────
SELECT
    n.id,
    n.name          AS nominee_name,
    n.email         AS nominee_email,
    n.access_status,
    n.access_requested_at,
    n.access_granted_at,
    u.name          AS user_name,
    u.email         AS user_email
FROM nominees n
JOIN users u ON n.user_id = u.id
WHERE n.access_status != 'none';


-- ─────────────────────────────────────────
-- 11. DELETE ALL DATA (USE WITH CAUTION!)
-- Only run this if you want to reset test data
-- ─────────────────────────────────────────
-- DELETE FROM vault_items;
-- DELETE FROM nominees;
-- DELETE FROM users;
