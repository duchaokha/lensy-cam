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

    // Check for date overlaps and optional time conflicts
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
                r.start_time IS NULL OR r.end_time IS NULL
                OR NOT (r.end_time <= ? OR r.start_time >= ?)
              )
          )
        ORDER BY c.name
      `;
      params = [end_date, start_date, start_time, end_time];
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
