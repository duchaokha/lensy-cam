const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ' ORDER BY created_at DESC';

    const customers = await db.all(sql, params);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer's rental history
    const rentals = await db.all(
      `SELECT r.*, c.name as camera_name, c.brand, c.model 
       FROM rentals r 
       JOIN cameras c ON r.camera_id = c.id 
       WHERE r.customer_id = ? 
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...customer, rentals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, id_number, notes } = req.body;

    const result = await db.run(
      `INSERT INTO customers (name, email, phone, address, id_number, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, address, id_number, notes]
    );

    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [result.id]);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, id_number, notes } = req.body;

    await db.run(
      `UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, id_number = ?, notes = ?
       WHERE id = ?`,
      [name, email, phone, address, id_number, notes, req.params.id]
    );

    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    // Check if customer has active rentals
    const activeRental = await db.get(
      'SELECT * FROM rentals WHERE customer_id = ? AND status = ?',
      [req.params.id, 'active']
    );

    if (activeRental) {
      return res.status(400).json({ error: 'Cannot delete customer with active rentals' });
    }

    await db.run('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
