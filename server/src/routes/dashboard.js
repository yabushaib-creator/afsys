const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [stats, recentCalls, byType, topTariffs] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM id_qn_fgn_vsl_call_details)     AS vessel_calls,
          (SELECT COUNT(*) FROM id_qn_fv_supply_details)         AS supply_lines,
          (SELECT COALESCE(SUM(qfs_f_amount), 0) FROM id_qn_fv_supply_details) AS total_f_amount,
          (SELECT COALESCE(SUM(qfs_l_amount), 0) FROM id_qn_fv_supply_details) AS total_l_amount
      `),
      pool.query(`
        SELECT qfvc_refno, qfvc_vessel, qfvc_name, qfvc_party,
               qfvc_eta, qfvc_etd, qfvc_captain
        FROM id_qn_fgn_vsl_call_details
        ORDER BY qfvc_refno DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT qfs_type,
               COUNT(*)                        AS line_count,
               COALESCE(SUM(qfs_l_amount), 0)  AS total_l_amount
        FROM id_qn_fv_supply_details
        GROUP BY qfs_type
        ORDER BY qfs_type
      `),
      pool.query(`
        SELECT qfs_tariff,
               COUNT(*)                        AS line_count,
               COALESCE(SUM(qfs_l_amount), 0)  AS total_l_amount
        FROM id_qn_fv_supply_details
        GROUP BY qfs_tariff
        ORDER BY total_l_amount DESC
        LIMIT 5
      `),
    ]);

    res.json({
      stats: stats.rows[0],
      recentCalls: recentCalls.rows,
      byType: byType.rows,
      topTariffs: topTariffs.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
