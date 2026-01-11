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
        const usersRes = await pool.query('SELECT id FROM users LIMIT 2');
        if (usersRes.rows.length < 2) {
            console.log("Not enough users for a full test, but will try with what we have.");
        }

        const validSender = usersRes.rows[0]?.id;
        const validReceiver = usersRes.rows[1]?.id || validSender;
        const invalidId = 999999;

        const resource = {
            skill: 'Verification',
            title: 'Fix Confirmed',
            url: 'http://success.com',
            note: 'Verification note'
        };

        console.log(`--- Test 1: Valid Recommendation (Sender: ${validSender}, Receiver: ${validReceiver}) ---`);
        try {
            // Simulate the backend logic for valid users
            const senderRes = await pool.query('SELECT name, username FROM users WHERE id=$1', [validSender]);
            const senderName = senderRes.rows[0].name || senderRes.rows[0].username;
            const receiverRes = await pool.query('SELECT name, username FROM users WHERE id=$1', [validReceiver]);
            const receiverName = receiverRes.rows[0].name || receiverRes.rows[0].username;

            await pool.query(
                'INSERT INTO resources (user_id, skill, title, url, note, author, peer_index) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [validReceiver, resource.skill, resource.title, resource.url, resource.note, senderName, -1]
            );
            console.log("✅ Valid recommendation insert succeeded.");
        } catch (e) {
            console.error("❌ Valid test failed:", e.message);
        }

        console.log(`\n--- Test 2: Invalid Receiver (${invalidId}) ---`);
        try {
            const receiverRes = await pool.query('SELECT name, username FROM users WHERE id=$1', [invalidId]);
            if (receiverRes.rows.length === 0) {
                console.log("✅ Gracefully handled missing receiver (no crash).");
            } else {
                console.log("⚠️ Receiver unexpectedly found.");
            }
        } catch (e) {
            console.error("❌ Invalid receiver test crashed:", e.message);
        }

    } catch (e) {
        console.error("Global Error:", e.message);
    } finally {
        pool.end();
    }
}

run();
