const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all offices
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_office_location_master ORDER BY off_company, off_office`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single office
router.get('/:company/:serial', async (req, res) => {
  try {
    const { company, serial } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_office_location_master WHERE off_company = $1 AND off_serial = $2`,
      [company, parseInt(serial)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Office location not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create office
router.post('/', async (req, res) => {
  const {
    off_company, off_office, off_office_name, off_location, off_location_name,
    off_notes, off_filter_0, off_filter_1, off_filter_2, off_filter_3, off_filter_4,
    off_filter_5, off_filter_6, off_filter_7, off_filter_8, off_filter_9,
    off_address_1, off_address_2, off_address_3, off_address_4, off_phone, off_fax,
    off_telex, off_email, off_contact, off_operation_map_line, off_report_head, off_office_short
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_office_location_master
       (off_company, off_office, off_office_name, off_location, off_location_name,
        off_notes, off_filter_0, off_filter_1, off_filter_2, off_filter_3, off_filter_4,
        off_filter_5, off_filter_6, off_filter_7, off_filter_8, off_filter_9,
        off_address_1, off_address_2, off_address_3, off_address_4, off_phone, off_fax,
        off_telex, off_email, off_contact, off_operation_map_line, off_report_head, off_office_short)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
       RETURNING *`,
      [off_company, off_office, off_office_name, off_location, off_location_name,
       off_notes, off_filter_0, off_filter_1, off_filter_2, off_filter_3, off_filter_4,
       off_filter_5, off_filter_6, off_filter_7, off_filter_8, off_filter_9,
       off_address_1, off_address_2, off_address_3, off_address_4, off_phone, off_fax,
       off_telex, off_email, off_contact, off_operation_map_line, off_report_head || 'L', off_office_short || '1']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update office
router.put('/:company/:serial', async (req, res) => {
  const { company, serial } = req.params;
  const {
    off_office, off_office_name, off_location, off_location_name, off_notes,
    off_filter_0, off_filter_1, off_filter_2, off_filter_3, off_filter_4, off_filter_5,
    off_filter_6, off_filter_7, off_filter_8, off_filter_9, off_address_1, off_address_2,
    off_address_3, off_address_4, off_phone, off_fax, off_telex, off_email, off_contact,
    off_operation_map_line, off_report_head, off_office_short
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_office_location_master
       SET off_office = $1, off_office_name = $2, off_location = $3, off_location_name = $4,
           off_notes = $5, off_filter_0 = $6, off_filter_1 = $7, off_filter_2 = $8,
           off_filter_3 = $9, off_filter_4 = $10, off_filter_5 = $11, off_filter_6 = $12,
           off_filter_7 = $13, off_filter_8 = $14, off_filter_9 = $15, off_address_1 = $16,
           off_address_2 = $17, off_address_3 = $18, off_address_4 = $19, off_phone = $20,
           off_fax = $21, off_telex = $22, off_email = $23, off_contact = $24,
           off_operation_map_line = $25, off_report_head = $26, off_office_short = $27
       WHERE off_company = $28 AND off_serial = $29
       RETURNING *`,
      [off_office, off_office_name, off_location, off_location_name, off_notes,
       off_filter_0, off_filter_1, off_filter_2, off_filter_3, off_filter_4, off_filter_5,
       off_filter_6, off_filter_7, off_filter_8, off_filter_9, off_address_1, off_address_2,
       off_address_3, off_address_4, off_phone, off_fax, off_telex, off_email, off_contact,
       off_operation_map_line, off_report_head, off_office_short, company, parseInt(serial)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Office location not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE office
router.delete('/:company/:serial', async (req, res) => {
  const { company, serial } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_office_location_master WHERE off_company = $1 AND off_serial = $2 RETURNING off_serial`,
      [company, parseInt(serial)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Office location not found.' });
    }
    res.json({ success: true, deleted: result.rows[0].off_serial });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
