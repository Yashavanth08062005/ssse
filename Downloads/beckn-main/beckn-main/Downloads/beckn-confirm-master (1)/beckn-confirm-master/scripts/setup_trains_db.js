const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    password: process.env.DB_PASSWORD || '2005',
    port: 5432,
};

async function setupDatabase() {
    const client = new Client(dbConfig);
    try {
        await client.connect();

        // Create database if not exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'trains_bpp'");
        if (res.rowCount === 0) {
            console.log('Creating database trains_bpp...');
            await client.query('CREATE DATABASE trains_bpp');
        } else {
            console.log('Database trains_bpp already exists.');
        }
    } catch (err) {
        console.error('Error checking/creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }

    // Connect to the new database
    const dbClient = new Client({ ...dbConfig, database: 'trains_bpp' });
    try {
        await dbClient.connect();
        console.log('Connected to trains_bpp.');

        const sqlPath = path.join(__dirname, '..', 'trains_bpp_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running setup SQL...');
        await dbClient.query(sql);
        console.log('Setup completed successfully.');
    } catch (err) {
        console.error('Error running setup SQL:', err);
    } finally {
        await dbClient.end();
    }
}

setupDatabase();
