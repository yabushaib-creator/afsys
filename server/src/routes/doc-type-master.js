const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const DEFAULT_COMPANY = 'QTC';

// GET all (optional ?module= filter)
router.get('/', async (req, res) => {
  const { module: docModule } = req.query;
  try {
    let query = `SELECT * FROM id_document_type_master WHERE doc_company=$1`;
    const params = [DEFAULT_COMPANY];
    if (docModule) {
      params.push(docModule);
      query += ` AND doc_module=$${params.length}`;
    }
    query += ` ORDER BY doc_type`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one
router.get('/:company/:doc_type', async (req, res) => {
  const { company, doc_type } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM id_document_type_master WHERE doc_company=$1 AND doc_type=$2`,
      [company, doc_type]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  const {
    doc_type, doc_name, doc_prefix, doc_short_name, doc_module, doc_base,
    doc_approval_required, doc_approval_numbers, doc_starting_number,
    doc_print_program, doc_print_path, doc_print_command,
    doc_print_call_1, doc_print_call_2, doc_print_call_3, doc_print_call_4,
    doc_printer, doc_notes, doc_posting_module, doc_printing, doc_online_posting,
  } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO id_document_type_master
        (doc_company, doc_type, doc_name, doc_prefix, doc_short_name, doc_module, doc_base,
         doc_approval_required, doc_approval_numbers, doc_starting_number,
         doc_print_program, doc_print_path, doc_print_command,
         doc_print_call_1, doc_print_call_2, doc_print_call_3, doc_print_call_4,
         doc_printer, doc_notes, doc_posting_module, doc_printing, doc_online_posting)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      RETURNING *
    `, [
      DEFAULT_COMPANY, doc_type, doc_name, doc_prefix, doc_short_name, doc_module, doc_base,
      doc_approval_required || 'N', doc_approval_numbers || 0, doc_starting_number || 1,
      doc_print_program, doc_print_path, doc_print_command,
      doc_print_call_1 || 'N', doc_print_call_2 || 'N', doc_print_call_3 || 'N', doc_print_call_4 || 'Y',
      doc_printer || 'LPT1', doc_notes, doc_posting_module, doc_printing || 'N', doc_online_posting || 'N',
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update
router.put('/:company/:doc_type', async (req, res) => {
  const { company, doc_type } = req.params;
  const {
    doc_name, doc_prefix, doc_short_name, doc_module, doc_base,
    doc_approval_required, doc_approval_numbers, doc_starting_number,
    doc_print_program, doc_print_path, doc_print_command,
    doc_print_call_1, doc_print_call_2, doc_print_call_3, doc_print_call_4,
    doc_printer, doc_notes, doc_posting_module, doc_printing, doc_online_posting,
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE id_document_type_master
      SET doc_name=$3, doc_prefix=$4, doc_short_name=$5, doc_module=$6, doc_base=$7,
          doc_approval_required=$8, doc_approval_numbers=$9, doc_starting_number=$10,
          doc_print_program=$11, doc_print_path=$12, doc_print_command=$13,
          doc_print_call_1=$14, doc_print_call_2=$15, doc_print_call_3=$16, doc_print_call_4=$17,
          doc_printer=$18, doc_notes=$19, doc_posting_module=$20, doc_printing=$21, doc_online_posting=$22
      WHERE doc_company=$1 AND doc_type=$2
      RETURNING *
    `, [
      company, doc_type,
      doc_name, doc_prefix, doc_short_name, doc_module, doc_base,
      doc_approval_required || 'N', doc_approval_numbers || 0, doc_starting_number || 1,
      doc_print_program, doc_print_path, doc_print_command,
      doc_print_call_1 || 'N', doc_print_call_2 || 'N', doc_print_call_3 || 'N', doc_print_call_4 || 'Y',
      doc_printer || 'LPT1', doc_notes, doc_posting_module, doc_printing || 'N', doc_online_posting || 'N',
    ]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:company/:doc_type', async (req, res) => {
  const { company, doc_type } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_document_type_master WHERE doc_company=$1 AND doc_type=$2 RETURNING doc_type`,
      [company, doc_type]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
