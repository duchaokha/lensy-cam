const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');
const calendarService = require('../services/calendar');

const router = express.Router();
router.use(authMiddleware);

/**
 * Helper function to calculate the number of inclusive calendar days between two dates.
 * This function normalizes dates to UTC midnight to avoid local timezone issues
 * and returns the number of calendar days the item is rented for.
 * @param {string} startDateString - The start date in 'YYYY-MM-DD' format.
 * @param {string} endDateString - The end date in 'YYYY-MM-DD' format.
 * @returns {number} The number of inclusive calendar days.
 */
const calculateRentalDays = (startDateString, endDateString) => {
  // Parse date strings directly as UTC to avoid timezone issues
  const [startYear, startMonth, startDay] = startDateString.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateString.split('-').map(Number);
  
  // Create UTC dates (month is 0-indexed in Date.UTC)
  const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));

  const timeDifference = endDate.getTime() - startDate.getTime();
  const oneDay = 1000 * 60 * 60 * 24;

  // Calculate days inclusively: (timeDifference / oneDay) gives the number of 
  // 24-hour periods. Adding 1 makes it the inclusive number of calendar days.
  const days = Math.floor(timeDifference / oneDay) + 1;
  
  return days;
};

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
    } else if (start_time && end_time) {
      // When times are provided, calculate based on actual duration
      const startDateTime = new Date(`${start_date}T${start_time}`);
      const endDateTime = new Date(`${end_date}T${end_time}`);
      const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      const days = Math.max(hours / 24, 0.5); // Minimum 0.5 day
      total_amount = days * daily_rate;
    } else {
      // No times provided: use calendar days
      const days = calculateRentalDays(start_date, end_date);
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
    
    const new_start_date = start_date || rental.start_date;
    const new_end_date = end_date || rental.end_date;
    const new_daily_rate = daily_rate || rental.daily_rate;

    if (custom_total_amount && parseFloat(custom_total_amount) > 0) {
      // Use custom amount provided by user
      total_amount = parseFloat(custom_total_amount);
    } else if (new_start_date && new_end_date && new_daily_rate) {
      const start_time_value = start_time !== undefined ? start_time : rental.start_time;
      const end_time_value = end_time !== undefined ? end_time : rental.end_time;
      
      if (start_time_value && end_time_value) {
        // When times are provided, calculate based on actual duration
        const startDateTime = new Date(`${new_start_date}T${start_time_value}`);
        const endDateTime = new Date(`${new_end_date}T${end_time_value}`);
        const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
        const days = Math.max(hours / 24, 0.5); // Minimum 0.5 day
        total_amount = days * new_daily_rate;
      } else {
        // No times provided: use calendar days
        const days = calculateRentalDays(new_start_date, new_end_date);
        total_amount = days * new_daily_rate;
      }
    }

    await db.run(
      `UPDATE rentals SET 
       start_date = ?, end_date = ?, start_time = ?, end_time = ?,
       daily_rate = ?,
       total_amount = ?, deposit = ?, actual_return_date = ?,
       status = ?, notes = ?
       WHERE id = ?`,
      [
        new_start_date,
        new_end_date,
        start_time !== undefined ? start_time : rental.start_time,
        end_time !== undefined ? end_time : rental.end_time,
        new_daily_rate,
        total_amount,
        deposit !== undefined ? deposit : rental.deposit,
        actual_return_date !== undefined ? actual_return_date : rental.actual_return_date,
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
