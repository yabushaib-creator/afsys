const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const tariffRoutes = require('./routes/tariff');
const vesselRoutes = require('./routes/vessels');
const lineRoutes = require('./routes/lines');
const countryRoutes = require('./routes/countries');
const currencyRoutes = require('./routes/currencies');
const officeRoutes = require('./routes/offices');
const userRoutes = require('./routes/users');
const userAccessRoutes = require('./routes/user-access');
const userGroupRoutes = require('./routes/user-groups');
const vesselCallRoutes = require('./routes/vessel-calls');
const arMasterRoutes = require('./routes/ar-master');
const supplyDetailsRoutes = require('./routes/supply-details');
const basisMasterRoutes = require('./routes/basis-master');
const supplyInquiryRoutes = require('./routes/supply-inquiry');
const dashboardRoutes = require('./routes/dashboard');
const arInvoiceRoutes = require('./routes/ar-invoice');
const docTypeMasterRoutes = require('./routes/doc-type-master');
const pool = require('./config/db');

const app = express();

app.use(helmet());
app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json());

// Public routes — no auth required
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

// All routes below require a valid JWT
app.use(requireAuth);

app.get('/api/cargo-types', async (req, res) => {
  try {
    const result = await pool.query(`SELECT cargo_code as value, cargo_name as label FROM id_cargo_type ORDER BY cargo_code`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/vessel-statuses', async (req, res) => {
  try {
    const result = await pool.query(`SELECT status_code as value, status_name as label FROM id_vessel_status ORDER BY status_code DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.use('/api/tariff', tariffRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/lines', lineRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-access', userAccessRoutes);
app.use('/api/user-groups', userGroupRoutes);
app.use('/api/vessel-calls', vesselCallRoutes);
app.use('/api/ar-master', arMasterRoutes);
app.use('/api/supply-details', supplyDetailsRoutes);
app.use('/api/basis-master', basisMasterRoutes);
app.use('/api/supply-inquiry', supplyInquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ar-invoice', arInvoiceRoutes);
app.use('/api/doc-type-master', docTypeMasterRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
