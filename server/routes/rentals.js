const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');
const calendarService = require('../services/calendar');

const router = express.Router();
router.use(authMiddleware);

// Get all rentals
router.get('/', async (req, res) => {
  try {
    const { status, camera_id, customer_id } = req.query;
    let sql = `
      SELECT r.*, 
             c.name as camera_name, c.brand, c.model, c.category,
             cust.name as customer_name, cust.phone as customer_phone
      FROM rentals r
      JOIN cameras c ON r.camera_id = c.id
      JOIN customers cust ON r.customer_id = cust.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    if (camera_id) {
      sql += ' AND r.camera_id = ?';
      params.push(camera_id);
    }

    if (customer_id) {
      sql += ' AND r.customer_id = ?';
      params.push(customer_id);
    }

    sql += ' ORDER BY r.start_date DESC, r.created_at DESC';

    const rentals = await db.all(sql, params);
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single rental
router.get('/:id', async (req, res) => {
  try {
    const rental = await db.get(
      `SELECT r.*, 
              c.name as camera_name, c.brand, c.model, c.category, c.serial_number,
              cust.name as customer_name, cust.phone as customer_phone, 
              cust.email as customer_email, cust.address as customer_address
       FROM rentals r
       JOIN cameras c ON r.camera_id = c.id
       JOIN customers cust ON r.customer_id = cust.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create rental
router.post('/', async (req, res) => {
  try {
    const {
      camera_id, customer_id, start_date, end_date,
      start_time, end_time, daily_rate,
      deposit, notes, custom_total_amount
    } = req.body;

    // Check if camera exists
    const camera = await db.get('SELECT * FROM cameras WHERE id = ?', [camera_id]);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    // Check for date/time conflicts with existing active rentals
    const conflictingRentals = await db.all(
      `SELECT * FROM rentals 
       WHERE camera_id = ? 
       AND status = 'active'
       AND NOT (end_date < ? OR start_date > ?)`,
      [camera_id, start_date, end_date]
    );

    // Check if there's a time overlap for rentals on overlapping dates
    for (const existingRental of conflictingRentals) {
      const newStart = new Date(`${start_date}T${start_time || '00:00'}`);
      const newEnd = new Date(`${end_date}T${end_time || '23:59'}`);
      const existingStart = new Date(`${existingRental.start_date}T${existingRental.start_time || '00:00'}`);
      const existingEnd = new Date(`${existingRental.end_date}T${existingRental.end_time || '23:59'}`);

      // Check if time ranges overlap
      if (!(newEnd <= existingStart || newStart >= existingEnd)) {
        return res.status(400).json({ 
          error: 'Camera is already rented during this time period',
          conflictingRental: {
            start_date: existingRental.start_date,
            end_date: existingRental.end_date,
            start_time: existingRental.start_time,
            end_time: existingRental.end_time
          }
        });
      }
    }

    // Calculate total amount (use custom amount if provided)
    let total_amount;
    
    if (custom_total_amount && parseFloat(custom_total_amount) > 0) {
      // Use custom amount provided by user
      total_amount = parseFloat(custom_total_amount);
    } else {
      // Calculate days for daily rental
      const start = new Date(start_date);
      const end = new Date(end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      total_amount = days * daily_rate;
    }

    // Create rental
    const result = await db.run(
      `INSERT INTO rentals 
       (camera_id, customer_id, start_date, end_date, start_time, end_time,
        daily_rate, total_amount, deposit, notes, status, rental_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [camera_id, customer_id, start_date, end_date || start_date,
       start_time, end_time, daily_rate,
       total_amount, deposit || 0, notes, 'active', 'daily']
    );

    // Get the created rental with full details
    const rental = await db.get('SELECT * FROM rentals WHERE id = ?', [result.id]);
    
    // Get customer details for calendar event
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [customer_id]);
    
    // Create calendar event
    const eventId = await calendarService.createRentalEvent(rental, camera, customer);
    if (eventId) {
      await db.run('UPDATE rentals SET calendar_event_id = ? WHERE id = ?', [eventId, result.id]);
      rental.calendar_event_id = eventId;
    }

    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update rental
router.put('/:id', async (req, res) => {
  try {
    const {
      start_date, end_date, start_time, end_time,
      daily_rate, deposit,
      actual_return_date, status, notes, custom_total_amount
    } = req.body;

    const rental = await db.get('SELECT * FROM rentals WHERE id = ?', [req.params.id]);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Recalculate total based on dates (use custom amount if provided)
    let total_amount = rental.total_amount;
    
    if (custom_total_amount && parseFloat(custom_total_amount) > 0) {
      // Use custom amount provided by user
      total_amount = parseFloat(custom_total_amount);
    } else if (start_date && end_date && daily_rate) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      total_amount = days * daily_rate;
    }

    await db.run(
      `UPDATE rentals SET 
       start_date = ?, end_date = ?, start_time = ?, end_time = ?,
       daily_rate = ?,
       total_amount = ?, deposit = ?, actual_return_date = ?,
       status = ?, notes = ?
       WHERE id = ?`,
      [
        start_date || rental.start_date,
        end_date || rental.end_date,
        start_time || rental.start_time,
        end_time || rental.end_time,
        daily_rate || rental.daily_rate,
        total_amount,
        deposit !== undefined ? deposit : rental.deposit,
        actual_return_date,
        status || rental.status,
        notes !== undefined ? notes : rental.notes,
        req.params.id
      ]
    );

    // Update camera status if rental completed or cancelled
    if (status === 'completed' || status === 'cancelled') {
      await db.run('UPDATE cameras SET status = ? WHERE id = ?', ['available', rental.camera_id]);
      
      // Delete calendar event if rental is cancelled
      if (status === 'cancelled' && rental.calendar_event_id) {
        await calendarService.deleteRentalEvent(rental.calendar_event_id);
        await db.run('UPDATE rentals SET calendar_event_id = NULL WHERE id = ?', [req.params.id]);
      }
    }

    const updatedRental = await db.get('SELECT * FROM rentals WHERE id = ?', [req.params.id]);
    res.json(updatedRental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return rental (complete rental)
router.post('/:id/return', async (req, res) => {
  try {
    const { actual_return_date } = req.body;
    const rental = await db.get('SELECT * FROM rentals WHERE id = ?', [req.params.id]);

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    await db.run(
      'UPDATE rentals SET status = ?, actual_return_date = ? WHERE id = ?',
      ['completed', actual_return_date || new Date().toISOString().split('T')[0], req.params.id]
    );

    await db.run('UPDATE cameras SET status = ? WHERE id = ?', ['available', rental.camera_id]);

    const updatedRental = await db.get('SELECT * FROM rentals WHERE id = ?', [req.params.id]);
    res.json(updatedRental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete rental
router.delete('/:id', async (req, res) => {
  try {
    const rental = await db.get('SELECT * FROM rentals WHERE id = ?', [req.params.id]);
    
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Make camera available again if rental was active
    if (rental.status === 'active') {
      await db.run('UPDATE cameras SET status = ? WHERE id = ?', ['available', rental.camera_id]);
    }

    // Delete calendar event if exists
    if (rental.calendar_event_id) {
      await calendarService.deleteRentalEvent(rental.calendar_event_id);
    }

    await db.run('DELETE FROM rentals WHERE id = ?', [req.params.id]);
    res.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
