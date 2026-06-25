const pool = require('./src/config/db');

async function run() {
  try {
    await pool.query(`
      INSERT INTO id_user_master
        (user_code, user_name, user_password, user_primary_group, user_status, user_admin_allow, user_default_company)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_code) DO UPDATE
        SET user_password = EXCLUDED.user_password,
            user_status = EXCLUDED.user_status,
            user_admin_allow = EXCLUDED.user_admin_allow
    `, ['YAS', 'Yas User', 'yas', 'ADMIN', 'A', 'Y', 'MIL']);

    console.log('✓ User YAS created/updated successfully');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

run();
