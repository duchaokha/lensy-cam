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

    sql += ' ORDER BY name ASC';

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

// Merge duplicate customers
router.post('/merge-duplicates', async (req, res) => {
  try {
    // Find all duplicate groups (customers with same name, email, phone, address, id_number)
    const duplicateGroups = await db.all(`
      SELECT name, email, phone, address, id_number, COUNT(*) as count
      FROM customers
      GROUP BY name, email, phone, address, id_number
      HAVING count > 1
    `);

    if (duplicateGroups.length === 0) {
      return res.json({ message: 'No duplicate customers found', merged: 0 });
    }

    let totalMerged = 0;
    let totalDeleted = 0;

    // Process each duplicate group
    for (const group of duplicateGroups) {
      // Get all customers in this duplicate group (ordered by id, oldest first)
      const duplicates = await db.all(`
        SELECT * FROM customers
        WHERE name = ? AND 
              COALESCE(email, '') = COALESCE(?, '') AND 
              COALESCE(phone, '') = COALESCE(?, '') AND 
              COALESCE(address, '') = COALESCE(?, '') AND 
              COALESCE(id_number, '') = COALESCE(?, '')
        ORDER BY id ASC
      `, [group.name, group.email, group.phone, group.address, group.id_number]);

      if (duplicates.length <= 1) continue;

      // Keep the first (oldest) customer
      const keepCustomer = duplicates[0];
      const duplicateIds = duplicates.slice(1).map(d => d.id);

      // Update all rentals from duplicate customers to point to the kept customer
      for (const duplicateId of duplicateIds) {
        await db.run(`
          UPDATE rentals SET customer_id = ? WHERE customer_id = ?
        `, [keepCustomer.id, duplicateId]);
      }

      // Delete the duplicate customer records
      const placeholders = duplicateIds.map(() => '?').join(',');
      await db.run(`
        DELETE FROM customers WHERE id IN (${placeholders})
      `, duplicateIds);

      totalMerged++;
      totalDeleted += duplicateIds.length;
    }

    res.json({
      message: 'Duplicate customers merged successfully',
      groupsMerged: totalMerged,
      customersDeleted: totalDeleted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
