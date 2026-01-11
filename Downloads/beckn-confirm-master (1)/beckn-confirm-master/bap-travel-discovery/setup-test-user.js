const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'travel_discovery',
    user: 'postgres',
    password: '2005'
});

async function setupTestUser() {
    const client = await pool.connect();
    try {
        // Check if admin user exists
        const existingUser = await client.query('SELECT * FROM users WHERE email = $1', ['admin@gmail.com']);

        if (existingUser.rows.length === 0) {
            console.log('Creating test user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await client.query(
                'INSERT INTO users (email, password, full_name, phone) VALUES ($1, $2, $3, $4)',
                ['admin@gmail.com', hashedPassword, 'Admin User', '+91-9876543210']
            );
            console.log('✅ Test user created: admin@gmail.com / admin123');
        } else {
            console.log('✅ Test user already exists: admin@gmail.com');
        }

        // List all users
        const users = await client.query('SELECT id, email, full_name FROM users');
        console.log('📋 Available users:');
        users.rows.forEach(user => {
            console.log(`   ${user.id}: ${user.email} (${user.full_name})`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

setupTestUser().catch(console.error);