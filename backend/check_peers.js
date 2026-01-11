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
        console.log("--- PEERS ---");
        const peers = await pool.query('SELECT * FROM peers');
        peers.rows.forEach(p => {
            console.log(`PeerID: ${p.id}, UserID: ${p.user_id}, LinkedUserID: ${p.linked_user_id}, Name: ${p.name}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

run();
