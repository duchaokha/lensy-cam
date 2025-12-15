const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Total cameras
    const totalCameras = await db.get('SELECT COUNT(*) as count FROM cameras');
    
    // Available cameras
    const availableCameras = await db.get(
      "SELECT COUNT(*) as count FROM cameras WHERE status = 'available'"
    );
    
    // Rented cameras
    const rentedCameras = await db.get(
      "SELECT COUNT(*) as count FROM cameras WHERE status = 'maintenance'"
    );
    
    // Active rentals
    const activeRentals = await db.get(
      "SELECT COUNT(*) as count FROM rentals WHERE status = 'active'"
    );
    
    // Total customers
    const totalCustomers = await db.get('SELECT COUNT(*) as count FROM customers');
    
    // Revenue this month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyRevenue = await db.get(
      `SELECT SUM(total_amount) as revenue 
       FROM rentals 
       WHERE strftime('%Y-%m', start_date) = ? AND status != 'cancelled'`,
      [currentMonth]
    );
    
    // Revenue this year
    const currentYear = new Date().getFullYear();
    const yearlyRevenue = await db.get(
      `SELECT SUM(total_amount) as revenue 
       FROM rentals 
       WHERE strftime('%Y', start_date) = ? AND status != 'cancelled'`,
      [currentYear.toString()]
    );
    
    // Total revenue
    const totalRevenue = await db.get(
      "SELECT SUM(total_amount) as revenue FROM rentals WHERE status != 'cancelled'"
    );
    
    // Overdue rentals
    const today = new Date().toISOString().split('T')[0];
    const overdueRentals = await db.get(
      "SELECT COUNT(*) as count FROM rentals WHERE status = 'active' AND end_date < ?",
      [today]
    );

    // Recent rentals
    const recentRentals = await db.all(
      `SELECT r.*, 
              c.name as camera_name, c.brand, c.model,
              cust.name as customer_name, cust.phone as customer_phone
       FROM rentals r
       JOIN cameras c ON r.camera_id = c.id
       JOIN customers cust ON r.customer_id = cust.id
       WHERE r.status = 'active'
       ORDER BY r.start_date DESC
       LIMIT 10`
    );

    // Monthly revenue chart data (last 6 months)
    const monthlyData = await db.all(
      `SELECT 
         strftime('%Y-%m', start_date) as month,
         SUM(total_amount) as revenue,
         COUNT(*) as rental_count
       FROM rentals
       WHERE status != 'cancelled'
         AND start_date >= date('now', '-6 months')
       GROUP BY strftime('%Y-%m', start_date)
       ORDER BY month ASC`
    );

    res.json({
      cameras: {
        total: totalCameras.count,
        available: availableCameras.count,
        rented: rentedCameras.count
      },
      rentals: {
        active: activeRentals.count,
        overdue: overdueRentals.count
      },
      customers: {
        total: totalCustomers.count
      },
      revenue: {
        monthly: monthlyRevenue.revenue || 0,
        yearly: yearlyRevenue.revenue || 0,
        total: totalRevenue.revenue || 0
      },
      recentRentals,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
