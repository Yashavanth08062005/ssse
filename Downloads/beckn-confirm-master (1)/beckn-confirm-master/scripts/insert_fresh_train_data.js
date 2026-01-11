const { Client } = require('pg');

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    password: process.env.DB_PASSWORD || '2005',
    port: 5432,
    database: 'trains_bpp'
};

const insertQuery = `
INSERT INTO trains (train_number, train_name, train_type, departure_city, arrival_city, 
    departure_station, arrival_station, departure_time, arrival_time, duration_minutes, 
    price_cc, price_ec, price_sl, price_3a, price_2a, price_1a, seats_available, amenities, status)
VALUES
    -- Bangalore to Chennai (Shatabdi)
    ('12028', 'Shatabdi Express', 'Shatabdi', 'Bangalore', 'Chennai', 
     'KSR Bengaluru City Junction (SBC)', 'MGR Chennai Central (MAS)',
     NOW() + INTERVAL '1 day 6 hours', NOW() + INTERVAL '1 day 11 hours', 300, 
     800.00, 1600.00, NULL, NULL, NULL, NULL, 120, 
     '{"pantry": true, "wifi": false, "ac": true}', 'ACTIVE'),

    -- Bangalore to Hyderabad (Vande Bharat)
    ('20607', 'Vande Bharat Express', 'Vande Bharat', 'Bangalore', 'Hyderabad',
     'KSR Bengaluru City Junction (SBC)', 'Kacheguda (KCG)',
     NOW() + INTERVAL '1 day 10 hours', NOW() + INTERVAL '1 day 12 hours', 120,
     500.00, 1000.00, NULL, NULL, NULL, NULL, 450,
     '{"pantry": true, "wifi": true, "ac": true, "cctv": true}', 'ACTIVE'),

    -- Bangalore to Delhi (Rajdhani)
    ('22691', 'Rajdhani Express', 'Rajdhani', 'Bangalore', 'Delhi',
     'KSR Bengaluru City Junction (SBC)', 'Hazrat Nizamuddin (NZM)',
     NOW() + INTERVAL '2 days 20 hours', NOW() + INTERVAL '4 days 6 hours', 2040,
     NULL, NULL, NULL, 3500.00, 5200.00, 8500.00, 60,
     '{"pantry": true, "wifi": false, "ac": true, "bedding": true}', 'ACTIVE'),

    -- Mumbai to Goa (Vande Bharat)
    ('22229', 'Vande Bharat Express', 'Vande Bharat', 'Mumbai', 'Goa',
     'CSMT Mumbai', 'Madgaon Junction',
     NOW() + INTERVAL '1 day 5 hours', NOW() + INTERVAL '1 day 13 hours', 480,
     1400.00, 2800.00, NULL, NULL, NULL, NULL, 300,
     '{"pantry": true, "wifi": true, "ac": true}', 'ACTIVE'),
     
    -- Delhi to Mumbai (Rajdhani)
    ('12952', 'Mumbai Rajdhani', 'Rajdhani', 'Delhi', 'Mumbai',
     'New Delhi (NDLS)', 'Mumbai Central (MMCT)',
     NOW() + INTERVAL '1 day 16 hours', NOW() + INTERVAL '2 days 8 hours', 960,
     NULL, NULL, NULL, 2800.00, 4100.00, 6800.00, 80,
     '{"pantry": true, "wifi": true, "ac": true, "bedding": true}', 'ACTIVE')
ON CONFLICT (train_number) 
DO UPDATE SET 
    departure_time = EXCLUDED.departure_time,
    arrival_time = EXCLUDED.arrival_time,
    seats_available = EXCLUDED.seats_available,
    status = 'ACTIVE';
`;

async function run() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('Connected to trains_bpp.');

        console.log('Inserting/Updating train data...');
        const res = await client.query(insertQuery);
        console.log(`Successfully processed train data. Row count: ${res.rowCount}`);

    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        await client.end();
    }
}

run();
