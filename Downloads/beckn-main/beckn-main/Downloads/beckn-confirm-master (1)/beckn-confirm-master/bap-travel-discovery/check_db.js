const { Pool } = require('pg');
// small helper that uses environment variables when available
(async () => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
  });
  try {
    const r = await pool.query("SELECT to_regclass('public.users') as exists");
    console.log(r.rows);
  } catch (e) {
    console.error('QUERY ERROR:', e.message);
  } finally {
    await pool.end();
  }
})();
