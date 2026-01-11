const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
    database: 'postgres' // Connect to default DB first
};

async function setupDatabase() {
    console.log('🚌 Setting up Buses BPP database...');

    // Step 1: Create Database
    const pool = new Pool(config);
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'buses_bpp'");
        if (res.rows.length === 0) {
            console.log('Creating database buses_bpp...');
            await client.query('CREATE DATABASE buses_bpp');
            console.log('✅ Database buses_bpp created.');
        } else {
            console.log('Database buses_bpp already exists.');
        }
        client.release();
    } catch (err) {
        console.error('❌ Error checking/creating database:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }

    // Step 2: Run SQL Schema
    const busesPool = new Pool({ ...config, database: 'buses_bpp' });
    try {
        const sqlPath = path.resolve(__dirname, '../buses_bpp_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running schema setup...');
        await busesPool.query(sql);
        console.log('✅ Buses BPP schema applied successfully.');

        // Verify data
        const res = await busesPool.query('SELECT COUNT(*) as count FROM buses');
        console.log(`📊 Total buses in database: ${res.rows[0].count}`);

    } catch (err) {
        console.error('❌ Error applying schema:', err);
        process.exit(1);
    } finally {
        await busesPool.end();
    }
}

setupDatabase();
