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
        console.log("--- USERS ---");
        const users = await pool.query('SELECT id, username, name FROM users');
        users.rows.forEach(u => console.log(`ID: ${u.id}, Username: ${u.username}, Name: ${u.name}`));

        console.log("\n--- PEERS ---");
        const peers = await pool.query('SELECT user_id, linked_user_id, name, company FROM peers');
        peers.rows.forEach(p => console.log(`UserID: ${p.user_id}, LinkedUserID: ${p.linked_user_id}, Name: ${p.name}, Company: ${p.company}`));

        console.log("\n--- PEER REQUESTS ---");
        const requests = await pool.query('SELECT id, sender_id, receiver_id, status FROM peer_requests');
        requests.rows.forEach(r => console.log(`ID: ${r.id}, SenderID: ${r.sender_id}, ReceiverID: ${r.receiver_id}, Status: ${r.status}`));

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

run();
