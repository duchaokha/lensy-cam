const db = require('./server/database');

async function testQuery() {
  console.log('Testing availability query...\n');
  
  // Get all cameras
  const allCameras = await db.all('SELECT id, name, status FROM cameras ORDER BY id');
  console.log('All cameras:');
  console.log(allCameras);
  console.log('');
  
  // Get active rentals
  const activeRentals = await db.all(`
    SELECT id, camera_id, start_date, end_date, status, rental_type 
    FROM rentals 
    WHERE status NOT IN ('returned', 'cancelled')
  `);
  console.log('Active rentals:');
  console.log(activeRentals);
  console.log('');
  
  // Test the availability query
  const query = `
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
  
  const params = ['2025-12-14', '2025-12-14'];
  console.log('Query params:', params);
  console.log('');
  
  const available = await db.all(query, params);
  console.log('Available cameras:');
  console.log(available);
  console.log('');
  
  // Also test the subquery alone
  const busyCameras = await db.all(`
    SELECT r.camera_id
    FROM rentals r
    WHERE r.status NOT IN ('returned', 'cancelled')
      AND r.start_date <= ?
      AND r.end_date >= ?
  `, params);
  console.log('Busy camera IDs:');
  console.log(busyCameras);
  
  process.exit(0);
}

testQuery().catch(console.error);
