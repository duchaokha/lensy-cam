const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all cameras
router.get('/', async (req, res) => {
  try {
    const { status, category, search, available_from, available_to } = req.query;
    let sql = 'SELECT * FROM cameras WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR brand LIKE ? OR model LIKE ? OR serial_number LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    sql += ' ORDER BY created_at DESC';

    let cameras = await db.all(sql, params);
    
    // If checking availability for specific dates, filter out cameras with conflicts
    if (available_from && available_to) {
      const availableCameras = [];
      for (const camera of cameras) {
        const conflict = await db.get(
          `SELECT * FROM rentals 
           WHERE camera_id = ? 
           AND status = 'active'
           AND NOT (end_date < ? OR start_date > ?)`,
          [camera.id, available_from, available_to]
        );
        if (!conflict) {
          availableCameras.push(camera);
        }
      }
      cameras = availableCameras;
    }
    
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single camera
router.get('/:id', async (req, res) => {
  try {
    const camera = await db.get('SELECT * FROM cameras WHERE id = ?', [req.params.id]);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    res.json(camera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create camera
router.post('/', async (req, res) => {
  try {
    const {
      name, brand, model, category, serial_number,
      purchase_date, purchase_price, daily_rate, hourly_rate,
      condition, description
    } = req.body;

    // Convert empty serial_number to NULL to avoid UNIQUE constraint issues
    const serialNum = serial_number && serial_number.trim() !== '' ? serial_number : null;

    const result = await db.run(
      `INSERT INTO cameras 
       (name, brand, model, category, serial_number, purchase_date, 
        purchase_price, daily_rate, hourly_rate, condition, description, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, model, category, serialNum, purchase_date,
       purchase_price, daily_rate, hourly_rate, condition || 'excellent', description, 'available']
    );

    const camera = await db.get('SELECT * FROM cameras WHERE id = ?', [result.id]);
    res.status(201).json(camera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update camera
router.put('/:id', async (req, res) => {
  try {
    const {
      name, brand, model, category, serial_number,
      purchase_date, purchase_price, daily_rate, hourly_rate,
      status, condition, description
    } = req.body;

    // Convert empty serial_number to NULL to avoid UNIQUE constraint issues
    const serialNum = serial_number && serial_number.trim() !== '' ? serial_number : null;

    await db.run(
      `UPDATE cameras SET 
       name = ?, brand = ?, model = ?, category = ?, serial_number = ?,
       purchase_date = ?, purchase_price = ?, daily_rate = ?, hourly_rate = ?,
       status = ?, condition = ?, description = ?
       WHERE id = ?`,
      [name, brand, model, category, serialNum, purchase_date,
       purchase_price, daily_rate, hourly_rate, status, condition, description, req.params.id]
    );

    const camera = await db.get('SELECT * FROM cameras WHERE id = ?', [req.params.id]);
    res.json(camera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete camera
router.delete('/:id', async (req, res) => {
  try {
    // Check if camera has active rentals
    const activeRental = await db.get(
      'SELECT * FROM rentals WHERE camera_id = ? AND status = ?',
      [req.params.id, 'active']
    );

    if (activeRental) {
      return res.status(400).json({ error: 'Cannot delete camera with active rentals' });
    }

    await db.run('DELETE FROM cameras WHERE id = ?', [req.params.id]);
    res.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
