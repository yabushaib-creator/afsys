const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all lines
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_line_master ORDER BY line_code`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single line
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_line_master WHERE line_code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Line not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create line
router.post('/', async (req, res) => {
  const {
    line_code, line_name, line_address_1, line_address_2, line_address_3,
    line_telephone, line_fax, line_email, line_bl_print, line_local_port_code,
    line_local_custom_code, line_name_others,
    line_filter_0, line_filter_1, line_filter_2, line_filter_3, line_filter_4,
    line_filter_5, line_filter_6, line_filter_7, line_filter_8, line_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_line_master
       (line_code, line_name, line_address_1, line_address_2, line_address_3,
        line_telephone, line_fax, line_email, line_bl_print, line_local_port_code,
        line_local_custom_code, line_name_others,
        line_filter_0, line_filter_1, line_filter_2, line_filter_3, line_filter_4,
        line_filter_5, line_filter_6, line_filter_7, line_filter_8, line_filter_9)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       RETURNING *`,
      [line_code, line_name, line_address_1, line_address_2 || null, line_address_3 || null,
       line_telephone, line_fax, line_email, line_bl_print || null, line_local_port_code || null,
       line_local_custom_code || null, line_name_others || null,
       line_filter_0 || null, line_filter_1 || null, line_filter_2 || null, line_filter_3 || null,
       line_filter_4 || null, line_filter_5 || null, line_filter_6 || null, line_filter_7 || null,
       line_filter_8 || null, line_filter_9 || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Line code already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update line
router.put('/:code', async (req, res) => {
  const { code } = req.params;
  const {
    line_name, line_address_1, line_address_2, line_address_3,
    line_telephone, line_fax, line_email, line_bl_print, line_local_port_code,
    line_local_custom_code, line_name_others,
    line_filter_0, line_filter_1, line_filter_2, line_filter_3, line_filter_4,
    line_filter_5, line_filter_6, line_filter_7, line_filter_8, line_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_line_master
       SET line_name = $1, line_address_1 = $2, line_address_2 = $3, line_address_3 = $4,
           line_telephone = $5, line_fax = $6, line_email = $7, line_bl_print = $8,
           line_local_port_code = $9, line_local_custom_code = $10, line_name_others = $11,
           line_filter_0 = $12, line_filter_1 = $13, line_filter_2 = $14, line_filter_3 = $15,
           line_filter_4 = $16, line_filter_5 = $17, line_filter_6 = $18, line_filter_7 = $19,
           line_filter_8 = $20, line_filter_9 = $21
       WHERE line_code = $22
       RETURNING *`,
      [line_name, line_address_1, line_address_2 || null, line_address_3 || null,
       line_telephone, line_fax, line_email, line_bl_print || null, line_local_port_code || null,
       line_local_custom_code || null, line_name_others || null,
       line_filter_0 || null, line_filter_1 || null, line_filter_2 || null, line_filter_3 || null,
       line_filter_4 || null, line_filter_5 || null, line_filter_6 || null, line_filter_7 || null,
       line_filter_8 || null, line_filter_9 || null, code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Line not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE line
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_line_master WHERE line_code = $1 RETURNING *`,
      [code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Line not found.' });
    res.json({ message: 'Deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
