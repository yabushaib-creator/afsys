const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all supply lines with optional filters, joined with vessel call info
router.get('/', async (req, res) => {
  const { date_from, date_to, refno, tariff, type, party, vessel } = req.query;

  const conditions = [];
  const params = [];
  let p = 1;

  if (date_from) { conditions.push(`s.qfs_date >= $${p++}`); params.push(date_from); }
  if (date_to)   { conditions.push(`s.qfs_date <= $${p++}`); params.push(date_to); }
  if (refno)     { conditions.push(`s.qfs_refno::text = $${p++}`); params.push(String(refno)); }
  if (tariff)    { conditions.push(`s.qfs_tariff ILIKE $${p++}`); params.push(`%${tariff}%`); }
  if (type)      { conditions.push(`s.qfs_type = $${p++}`); params.push(type); }
  if (party)     { conditions.push(`s.qfs_party ILIKE $${p++}`); params.push(`%${party}%`); }
  if (vessel)    { conditions.push(`(s.qfs_vessel ILIKE $${p} OR c.qfvc_name ILIKE $${p})`); params.push(`%${vessel}%`); p++; }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT
         s.qfs_company, s.qfs_refno, s.qfs_vessel,
         c.qfvc_name   AS vessel_name,
         c.qfvc_eta    AS vessel_eta,
         c.qfvc_etd    AS vessel_etd,
         c.qfvc_captain AS vessel_captain,
         s.qfs_party, s.qfs_tariff, s.qfs_date, s.qfs_basis,
         s.qfs_quantity, s.qfs_currency, s.qfs_exrate, s.qfs_rate,
         s.qfs_f_amount, s.qfs_l_amount, s.qfs_type,
         s.qfs_description, s.qfs_remarks,
         s.qfs_supplier, s.qfs_supplier_rate, s.qfs_supplier_ref,
         s.qfs_inv_type, s.qfs_inv_number, s.qfs_rct_type, s.qfs_rct_number,
         s.qfs_inv_rct_date, s.qfs_created_by, s.qfs_created_on
       FROM id_qn_fv_supply_details s
       LEFT JOIN id_qn_fgn_vsl_call_details c
         ON c.qfvc_company = s.qfs_company AND c.qfvc_refno = s.qfs_refno
       ${where}
       ORDER BY s.qfs_date DESC, s.qfs_refno, s.qfs_tariff`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
