const fs = require('fs');
const { Pool } = require('pg');

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2005',
  dbName: process.env.DB_NAME || 'travel_discovery',
};

(async () => {
  try {
    // connect to default postgres DB to create target DB if needed
    const adminPool = new Pool({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, database: 'postgres' });
    const exists = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [cfg.dbName]);
    if (exists.rows.length === 0) {
      console.log(`Creating database ${cfg.dbName}...`);
      await adminPool.query(`CREATE DATABASE ${cfg.dbName}`);
      console.log('Database created');
    } else {
      console.log(`Database ${cfg.dbName} already exists`);
    }
    await adminPool.end();

    // connect to target DB and run SQL files
    const pool = new Pool({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, database: cfg.dbName });

    const files = [
      'database-setup.sql',
      'database-auth-setup.sql',
      'add-del-bom-flights.sql'
    ];

    for (const f of files) {
      const path = require('path').resolve(__dirname, '..', f);
      if (fs.existsSync(path)) {
        console.log(`Running ${path} ...`);
        const sql = fs.readFileSync(path, 'utf8');
        // split on semicolon may fail for functions; instead run whole file with client.query
        try {
          await pool.query(sql);
          console.log(`Executed ${path}`);
        } catch (e) {
          console.error(`Error executing ${path}:`, e.message);
        }
      } else {
        console.warn(`File not found: ${path}`);
      }
    }

    await pool.end();
    console.log('Database setup finished');
  } catch (e) {
    console.error('Setup error:', e.message);
    process.exit(1);
  }
})();
