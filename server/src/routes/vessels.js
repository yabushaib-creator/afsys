const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all vessels
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_vessel_master ORDER BY vessel_code`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single vessel
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_vessel_master WHERE vessel_code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create vessel
router.post('/', async (req, res) => {
  const {
    vessel_code, vessel_name, vessel_owned_line, vessel_cargo, vessel_imco_allow,
    vessel_reefer_allow, vessel_out_allow, vessel_45_status, vessel_lifting_capacity,
    vessel_ramp_capacity, vessel_height_clearance, vessel_flag_country, vessel_year_build,
    vessel_flex_1, vessel_flex_2, vessel_flex_3, vessel_notes,
    vessel_filter_0, vessel_filter_1, vessel_filter_2, vessel_filter_3, vessel_filter_4,
    vessel_filter_5, vessel_filter_6, vessel_filter_7, vessel_filter_8, vessel_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_vessel_master
       (vessel_code, vessel_name, vessel_owned_line, vessel_cargo, vessel_imco_allow,
        vessel_reefer_allow, vessel_out_allow, vessel_45_status, vessel_lifting_capacity,
        vessel_ramp_capacity, vessel_height_clearance, vessel_flag_country, vessel_year_build,
        vessel_flex_1, vessel_flex_2, vessel_flex_3, vessel_notes,
        vessel_filter_0, vessel_filter_1, vessel_filter_2, vessel_filter_3, vessel_filter_4,
        vessel_filter_5, vessel_filter_6, vessel_filter_7, vessel_filter_8, vessel_filter_9)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
       RETURNING *`,
      [vessel_code, vessel_name, vessel_owned_line || null, vessel_cargo || 'C', vessel_imco_allow || 'Y',
       vessel_reefer_allow || 'Y', vessel_out_allow || 'Y', vessel_45_status || 'Y', vessel_lifting_capacity || 0,
       vessel_ramp_capacity || 0, vessel_height_clearance || 0, vessel_flag_country || null, vessel_year_build,
       vessel_flex_1 || null, vessel_flex_2 || null, vessel_flex_3 || null, vessel_notes || null,
       vessel_filter_0 || null, vessel_filter_1 || null, vessel_filter_2 || null, vessel_filter_3 || null,
       vessel_filter_4 || null, vessel_filter_5 || null, vessel_filter_6 || null, vessel_filter_7 || null,
       vessel_filter_8 || null, vessel_filter_9 || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Vessel code already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update vessel
router.put('/:code', async (req, res) => {
  const { code } = req.params;
  const {
    vessel_name, vessel_owned_line, vessel_cargo, vessel_imco_allow,
    vessel_reefer_allow, vessel_out_allow, vessel_45_status, vessel_lifting_capacity,
    vessel_ramp_capacity, vessel_height_clearance, vessel_flag_country, vessel_year_build,
    vessel_flex_1, vessel_flex_2, vessel_flex_3, vessel_notes,
    vessel_filter_0, vessel_filter_1, vessel_filter_2, vessel_filter_3, vessel_filter_4,
    vessel_filter_5, vessel_filter_6, vessel_filter_7, vessel_filter_8, vessel_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_vessel_master
       SET vessel_name = $1, vessel_owned_line = $2, vessel_cargo = $3, vessel_imco_allow = $4,
           vessel_reefer_allow = $5, vessel_out_allow = $6, vessel_45_status = $7, vessel_lifting_capacity = $8,
           vessel_ramp_capacity = $9, vessel_height_clearance = $10, vessel_flag_country = $11, vessel_year_build = $12,
           vessel_flex_1 = $13, vessel_flex_2 = $14, vessel_flex_3 = $15, vessel_notes = $16,
           vessel_filter_0 = $17, vessel_filter_1 = $18, vessel_filter_2 = $19, vessel_filter_3 = $20, vessel_filter_4 = $21,
           vessel_filter_5 = $22, vessel_filter_6 = $23, vessel_filter_7 = $24, vessel_filter_8 = $25, vessel_filter_9 = $26
       WHERE vessel_code = $27
       RETURNING *`,
      [vessel_name, vessel_owned_line || null, vessel_cargo || 'C', vessel_imco_allow || 'Y',
       vessel_reefer_allow || 'Y', vessel_out_allow || 'Y', vessel_45_status || 'Y', vessel_lifting_capacity || 0,
       vessel_ramp_capacity || 0, vessel_height_clearance || 0, vessel_flag_country || null, vessel_year_build,
       vessel_flex_1 || null, vessel_flex_2 || null, vessel_flex_3 || null, vessel_notes || null,
       vessel_filter_0 || null, vessel_filter_1 || null, vessel_filter_2 || null, vessel_filter_3 || null,
       vessel_filter_4 || null, vessel_filter_5 || null, vessel_filter_6 || null, vessel_filter_7 || null,
       vessel_filter_8 || null, vessel_filter_9 || null, code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vessel not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE vessel
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_vessel_master WHERE vessel_code = $1 RETURNING *`,
      [code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vessel not found.' });
    res.json({ message: 'Deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
