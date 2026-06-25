const pool = require('./src/config/db');

const cargoTypes = [
  { code: 'C', name: 'Container' },
  { code: 'G', name: 'General Cargo' },
  { code: 'R', name: 'Roro' },
  { code: 'B', name: 'Break Bulk' },
  { code: 'L', name: 'Livestock' },
  { code: 'O', name: 'Oil' },
  { code: 'P', name: 'Passenger' },
  { code: 'S', name: 'Special Cargo' }
];

async function setup() {
  try {
    // Create cargo type table
    console.log('Creating id_cargo_type table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_cargo_type (
        cargo_code VARCHAR(1) PRIMARY KEY NOT NULL,
        cargo_name VARCHAR(50) NOT NULL
      );
    `);
    console.log('✓ Table created');

    // Insert cargo types
    console.log('\nInserting cargo types...');
    for (const cargo of cargoTypes) {
      await pool.query(
        'INSERT INTO id_cargo_type (cargo_code, cargo_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [cargo.code, cargo.name]
      );
    }

    // Verify
    const result = await pool.query('SELECT * FROM id_cargo_type ORDER BY cargo_code');
    console.log('\n✓ Cargo Types:');
    result.rows.forEach(row => {
      console.log(`  ${row.cargo_code} = ${row.cargo_name}`);
    });

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

setup();
