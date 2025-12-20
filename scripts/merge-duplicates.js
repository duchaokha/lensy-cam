const db = require('../server/database');

async function mergeDuplicateCustomers() {
  try {
    console.log('Searching for duplicate customers...\n');
    
    // Find all duplicate groups
    const duplicateGroups = await db.all(`
      SELECT name, email, phone, address, id_number, COUNT(*) as count
      FROM customers
      GROUP BY name, email, phone, address, id_number
      HAVING count > 1
    `);

    if (duplicateGroups.length === 0) {
      console.log('✓ No duplicate customers found');
      process.exit(0);
    }

    console.log(`Found ${duplicateGroups.length} duplicate group(s):\n`);
    duplicateGroups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.name} (${group.count} duplicates)`);
    });
    console.log('');

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

      console.log(`Merging "${group.name}":`);
      console.log(`  Keeping customer ID: ${keepCustomer.id}`);
      console.log(`  Removing customer IDs: ${duplicateIds.join(', ')}`);

      // Update all rentals from duplicate customers to point to the kept customer
      for (const duplicateId of duplicateIds) {
        const result = await db.run(`
          UPDATE rentals SET customer_id = ? WHERE customer_id = ?
        `, [keepCustomer.id, duplicateId]);
        
        if (result.changes > 0) {
          console.log(`  - Moved ${result.changes} rental(s) from customer ${duplicateId} to ${keepCustomer.id}`);
        }
      }

      // Delete the duplicate customer records
      const placeholders = duplicateIds.map(() => '?').join(',');
      await db.run(`
        DELETE FROM customers WHERE id IN (${placeholders})
      `, duplicateIds);

      totalMerged++;
      totalDeleted += duplicateIds.length;
      console.log('');
    }

    console.log('✓ Merge completed successfully!');
    console.log(`  - ${totalMerged} duplicate group(s) merged`);
    console.log(`  - ${totalDeleted} duplicate customer(s) removed`);
    
    // Show final customer count
    const finalCount = await db.get('SELECT COUNT(*) as count FROM customers');
    console.log(`  - Final customer count: ${finalCount.count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error merging duplicates:', error);
    process.exit(1);
  }
}

// Run the merge
mergeDuplicateCustomers();
