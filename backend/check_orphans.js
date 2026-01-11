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
        console.log("Checking for orphaned peer links...");
        const orphans = await pool.query(`
            SELECT p.id, p.user_id, p.linked_user_id, p.name
            FROM peers p
            LEFT JOIN users u ON p.linked_user_id = u.id
            WHERE p.linked_user_id IS NOT NULL AND u.id IS NULL
        `);

        if (orphans.rows.length > 0) {
            console.log("Found Orphans:");
            orphans.rows.forEach(r => console.log(JSON.stringify(r)));
        } else {
            console.log("No orphans found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

run();
