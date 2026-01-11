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
    // senderId: 11, receiverId: 27
    const senderId = 11;
    const receiverId = 27;
    const resource = {
        skill: 'Java',
        title: 'Java test',
        url: 'https://www.w3schools.com/java/',
        note: 'test note'
    };

    try {
        console.log(`Simulating recommendation from ${senderId} to ${receiverId}`);

        // Get sender name
        const senderRes = await pool.query('SELECT name, username FROM users WHERE id=$1', [senderId]);
        if (senderRes.rows.length === 0) throw new Error("Sender not found");
        const senderName = senderRes.rows[0].name || senderRes.rows[0].username;
        console.log("Sender Name:", senderName);

        // Get receiver name
        const receiverRes = await pool.query('SELECT name, username FROM users WHERE id=$1', [receiverId]);
        if (receiverRes.rows.length === 0) throw new Error("Receiver not found");
        const receiverName = receiverRes.rows[0].name || receiverRes.rows[0].username;
        console.log("Receiver Name:", receiverName);

        // 1. Insert into RECEIVER'S list
        console.log("Inserting into receiver's list...");
        await pool.query(
            'INSERT INTO resources (user_id, skill, title, url, note, author, peer_index) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [receiverId, resource.skill, resource.title, resource.url, resource.note, senderName, -1]
        );

        // 2. Insert into SENDER'S list
        const sentNote = (resource.note ? resource.note + " " : "") + `(Sent to ${receiverName})`;
        console.log("Inserting into sender's list...");
        await pool.query(
            'INSERT INTO resources (user_id, skill, title, url, note, author, peer_index) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [senderId, resource.skill, resource.title, resource.url, sentNote, "You", 0]
        );

        console.log("✅ Success!");
    } catch (err) {
        console.error("❌ Error caught:", err.message);
        console.error(err.stack);
    } finally {
        pool.end();
    }
}

run();
