const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Check camera availability for a given date/time range
router.get('/', async (req, res) => {
  try {
    const { start_date, end_date, start_time, end_time, rental_type } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Build query to find available cameras
    // A camera is available if it has NO overlapping active rentals
    let query;
    let params;

    if (rental_type === 'hourly' && start_time && end_time) {
      // For hourly rentals on the same day
      query = `
        SELECT c.*
        FROM cameras c
        WHERE c.status = 'available'
          AND c.id NOT IN (
            SELECT r.camera_id
            FROM rentals r
            WHERE r.status NOT IN ('returned', 'cancelled')
              AND (
                -- Conflicts with daily rentals that overlap the date
                (r.rental_type = 'daily' AND r.start_date <= ? AND r.end_date >= ?)
                OR
                -- Conflicts with hourly rentals on same date with overlapping times
                (r.rental_type = 'hourly' AND r.start_date = ? 
                 AND r.start_time < ? AND r.end_time > ?)
              )
          )
        ORDER BY c.name
      `;
      params = [start_date, start_date, start_date, end_time, start_time];
    } else {
      // For daily rentals
      query = `
        SELECT c.*
        FROM cameras c
        WHERE c.status = 'available'
          AND c.id NOT IN (
            SELECT r.camera_id
            FROM rentals r
            WHERE r.status NOT IN ('returned', 'cancelled')
              AND r.start_date <= ?
              AND r.end_date >= ?
          )
        ORDER BY c.name
      `;
      params = [end_date, start_date];
    }

    const cameras = await db.all(query, params);
    res.json(cameras);
  } catch (err) {
    console.error('Availability query error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
