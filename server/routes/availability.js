const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Debug endpoint to check all cameras and rentals
router.get('/debug', async (req, res) => {
  try {
    const allCameras = await db.all('SELECT id, name, status FROM cameras ORDER BY id');
    const activeRentals = await db.all(`
      SELECT id, camera_id, start_date, end_date, status, rental_type 
      FROM rentals 
      WHERE status IN ('active', 'overdue')
      ORDER BY id
    `);
    
    // Test availability query for today
    const testDate = '2025-12-14';
    const availabilityQuery = `
      SELECT c.*
      FROM cameras c
      WHERE c.status = 'available'
        AND c.id NOT IN (
          SELECT r.camera_id
          FROM rentals r
          WHERE r.status IN ('active', 'overdue')
            AND r.start_date <= ?
            AND r.end_date >= ?
        )
      ORDER BY c.name
    `;
    const availableCameras = await db.all(availabilityQuery, [testDate, testDate]);
    
    // Get busy cameras
    const busyCameras = await db.all(`
      SELECT r.camera_id
      FROM rentals r
      WHERE r.status IN ('active', 'overdue')
        AND r.start_date <= ?
        AND r.end_date >= ?
    `, [testDate, testDate]);
    
    res.json({ 
      allCameras, 
      activeRentals, 
      testDate,
      availableCameras,
      busyCameras
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check camera availability for a given date/time range
router.get('/', async (req, res) => {
  try {
    const { start_date, end_date, start_time, end_time, rental_type } = req.query;

    console.log('=== AVAILABILITY CHECK ===');
    console.log('Query params:', { start_date, end_date, start_time, end_time, rental_type });

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Build query to find available cameras
    // A camera is available if it has NO overlapping active rentals
    let query;
    let params;

    // IMPORTANT FIX: Properly handle both single-day and multi-day rentals
    // 
    // Date overlap happens when: rental_start_date <= search_end_date AND rental_end_date >= search_start_date
    // 
    // Time overlap is more complex:
    // 1. If rental has NULL times: treat as full-day rental (always conflicts on overlapping dates)
    // 2. For multi-day rentals (rental_start_date < rental_end_date):
    //    - Search dates completely within rental dates: ALWAYS conflicts
    //    - Search starts on rental start date: Check if search_start_time conflicts
    //    - Search ends on rental end date: Check if search_end_time conflicts
    // 3. For same-day rentals: Allow back-to-back bookings (customer returns before end time)
    //
    // Note: Using <= and >= allows exact boundary matches (e.g., 13:00 end, 13:00 start)
    // This is intentional as customers typically return cameras before the scheduled end time
    
    if (start_time && end_time) {
      query = `
        SELECT c.*
        FROM cameras c
        WHERE c.status = 'available'
          AND c.id NOT IN (
            SELECT r.camera_id
            FROM rentals r
            WHERE r.status IN ('active', 'overdue')
              AND r.start_date <= ?
              AND r.end_date >= ?
              AND (
                -- Case 1: Rental has no time info (treat as full-day)
                r.start_time IS NULL OR r.end_time IS NULL
                -- Case 2: Multi-day rental - check if search falls within rental period
                OR (
                  r.start_date < r.end_date
                  AND (
                    -- Search dates completely within rental dates (always conflicts)
                    (? > r.start_date AND ? < r.end_date)
                    -- Search starts on rental start date and overlaps start time
                    OR (? = r.start_date AND NOT (r.start_time >= ?))
                    -- Search ends on rental end date and overlaps end time
                    OR (? = r.end_date AND NOT (r.end_time <= ?))
                    -- Search completely covers the rental period
                    OR (? <= r.start_date AND ? >= r.end_date)
                  )
                )
                -- Case 3: Same-day rental - allow back-to-back bookings
                OR (
                  r.start_date = r.end_date
                  AND NOT (r.end_time <= ? OR r.start_time >= ?)
                )
              )
          )
        ORDER BY c.name
      `;
      // Parameters: end_date(1), start_date(2), start_date(3), end_date(4), 
      //             start_date(5), start_time(6), end_date(7), end_time(8),
      //             start_date(9), end_date(10), start_time(11), end_time(12)
      params = [
        end_date, start_date,           // Date overlap check
        start_date, end_date,            // Multi-day: search within rental
        start_date, start_time,          // Multi-day: search starts on rental start
        end_date, end_time,              // Multi-day: search ends on rental end  
        start_date, end_date,            // Multi-day: search covers rental
        start_time, end_time             // Same-day: time overlap
      ];
    } else {
      query = `
        SELECT c.*
        FROM cameras c
        WHERE c.status = 'available'
          AND c.id NOT IN (
            SELECT r.camera_id
            FROM rentals r
            WHERE r.status IN ('active', 'overdue')
              AND r.start_date <= ?
              AND r.end_date >= ?
          )
        ORDER BY c.name
      `;
      params = [end_date, start_date];
    }

    console.log('Query params:', params);
    console.log('Rental type:', rental_type);
    console.log('SQL Query:', query);

    const cameras = await db.all(query, params);
    
    // Also get all cameras and rentals for debugging
    const allCameras = await db.all('SELECT id, name, status FROM cameras');
    const activeRentals = await db.all(`
      SELECT id, camera_id, start_date, end_date, status, rental_type 
      FROM rentals 
      WHERE status NOT IN ('returned', 'cancelled')
    `);
    
    console.log('All cameras:', allCameras);
    console.log('Active rentals:', activeRentals);
    console.log('Available cameras:', cameras);
    console.log('=========================');

    res.json(cameras);
  } catch (err) {
    console.error('Availability query error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
