const pool = require('./src/config/db');

const currencies = [
  { code: 'AED', name: 'United Arab Emirates Dirham', corporate: 3.6725, customer: 3.6725, market: 3.6725, other: 3.6725 },
  { code: 'USD', name: 'United States Dollar', corporate: 1.0, customer: 1.0, market: 1.0, other: 1.0 },
  { code: 'EUR', name: 'Euro', corporate: 1.08, customer: 1.08, market: 1.08, other: 1.08 },
  { code: 'GBP', name: 'British Pound', corporate: 1.27, customer: 1.27, market: 1.27, other: 1.27 },
  { code: 'QAR', name: 'Qatari Riyal', corporate: 3.6425, customer: 3.6425, market: 3.6425, other: 3.6425 },
  { code: 'SAR', name: 'Saudi Arabian Riyal', corporate: 3.75, customer: 3.75, market: 3.75, other: 3.75 },
  { code: 'KWD', name: 'Kuwaiti Dinar', corporate: 0.3069, customer: 0.3069, market: 0.3069, other: 0.3069 },
  { code: 'BHD', name: 'Bahraini Dinar', corporate: 0.376, customer: 0.376, market: 0.376, other: 0.376 },
  { code: 'OMR', name: 'Omani Rial', corporate: 0.385, customer: 0.385, market: 0.385, other: 0.385 },
  { code: 'INR', name: 'Indian Rupee', corporate: 83.45, customer: 83.45, market: 83.45, other: 83.45 },
  { code: 'SGD', name: 'Singapore Dollar', corporate: 1.34, customer: 1.34, market: 1.34, other: 1.34 },
  { code: 'HKD', name: 'Hong Kong Dollar', corporate: 7.81, customer: 7.81, market: 7.81, other: 7.81 },
  { code: 'JPY', name: 'Japanese Yen', corporate: 149.5, customer: 149.5, market: 149.5, other: 149.5 },
];

async function populate() {
  try {
    console.log('Populating currencies...');
    let inserted = 0;

    for (const curr of currencies) {
      try {
        await pool.query(
          `INSERT INTO id_currency_master
           (currency_company, currency_code, currency_name, currency_corporate_rate,
            currency_customer_rate, currency_market_rate, currency_other_rate)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (currency_company, currency_code) DO UPDATE
           SET currency_name = $3`,
          ['MILAHA', curr.code, curr.name, curr.corporate, curr.customer, curr.market, curr.other]
        );
        inserted++;
        console.log(`  ✓ ${curr.code} - ${curr.name}`);
      } catch (err) {
        console.log(`  ✗ ${curr.code} - ${err.message}`);
      }
    }

    console.log(`\n✓ ${inserted} currencies inserted/updated`);

    // Verify
    const result = await pool.query('SELECT COUNT(*) as count FROM id_currency_master');
    console.log(`\nTotal currencies in database: ${result.rows[0].count}`);

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

populate();
