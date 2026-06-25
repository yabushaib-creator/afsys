const pool = require('./src/config/db');

async function setup() {
  try {
    // Create yes/no status lookup table
    console.log('Creating id_vessel_status table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_vessel_status (
        status_code VARCHAR(1) PRIMARY KEY NOT NULL,
        status_name VARCHAR(50) NOT NULL,
        description VARCHAR(200)
      );
    `);
    console.log('✓ Table created');

    // Insert status values
    const statuses = [
      { code: 'Y', name: 'Allowed', desc: 'Feature/Cargo is allowed' },
      { code: 'N', name: 'Not Allowed', desc: 'Feature/Cargo is not allowed' }
    ];

    console.log('\nInserting status values...');
    for (const status of statuses) {
      await pool.query(
        'INSERT INTO id_vessel_status (status_code, status_name, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [status.code, status.name, status.desc]
      );
    }

    // Verify
    const result = await pool.query('SELECT * FROM id_vessel_status ORDER BY status_code DESC');
    console.log('\n✓ Vessel Status Lookup:');
    result.rows.forEach(row => {
      console.log(`  ${row.status_code} = ${row.status_name}`);
    });

    // List fields that use this lookup
    console.log('\n✓ Fields using this lookup in id_vessel_master:');
    console.log('  • vessel_imco_allow (IMCO Allowed)');
    console.log('  • vessel_reefer_allow (Reefer Allowed)');
    console.log('  • vessel_out_allow (Out of Gauge Allowed)');
    console.log('  • vessel_45_status (45\' Container Allowed)');

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

setup();
