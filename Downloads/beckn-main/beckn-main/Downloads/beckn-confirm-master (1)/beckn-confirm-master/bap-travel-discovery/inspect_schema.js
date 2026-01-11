const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

(async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'bookings'
            ORDER BY ordinal_position;
        `);
        const fs = require('fs');
        fs.writeFileSync('schema_output.json', JSON.stringify(res.rows, null, 2));
        console.log('Schema written to schema_output.json');
    } catch (err) {
        console.error('Error identifying schema:', err);
    } finally {
        await pool.end();
    }
})();
