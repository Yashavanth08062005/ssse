const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

async function run() {
    try {
        console.log("🧹 Starting cleanup of orphaned peer links...");

        // 1. Find and delete peers where user_id does not exist
        const orphanUserRes = await pool.query(`
            DELETE FROM peers 
            WHERE user_id NOT IN (SELECT id FROM users)
            RETURNING id, user_id
        `);
        console.log(`✅ Removed ${orphanUserRes.rowCount} entries with non-existent user_id.`);

        // 2. Find and delete peers where linked_user_id does not exist (and is not null)
        const orphanLinkRes = await pool.query(`
            DELETE FROM peers 
            WHERE linked_user_id IS NOT NULL 
            AND linked_user_id NOT IN (SELECT id FROM users)
            RETURNING id, linked_user_id
        `);
        console.log(`✅ Removed ${orphanLinkRes.rowCount} entries with non-existent linked_user_id.`);

        // 3. Cleanup peer_requests as well
        const orphanReqRes = await pool.query(`
            DELETE FROM peer_requests
            WHERE sender_id NOT IN (SELECT id FROM users)
            OR receiver_id NOT IN (SELECT id FROM users)
            RETURNING id
        `);
        console.log(`✅ Removed ${orphanReqRes.rowCount} orphaned peer requests.`);

        console.log("🎉 Cleanup complete.");
    } catch (e) {
        console.error("❌ Cleanup Error:", e.message);
    } finally {
        pool.end();
    }
}

run();
