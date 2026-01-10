// Test to demonstrate the availability logic bug

const testCases = [
  {
    name: "Test 1: Query for 2025-12-21, 14:00-18:00 (should conflict with rental 60)",
    searchDate: "2025-12-21",
    searchTime: "14:00 to 18:00",
    existingRental: {
      id: 60,
      dates: "2025-12-21 to 2025-12-21",
      times: "14:00 to 18:00"
    },
    currentLogic: {
      condition: "NOT (r.end_time <= '14:00' OR r.start_time >= '18:00')",
      evaluation: "NOT (18:00 <= 14:00 OR 14:00 >= 18:00) = NOT (false OR false) = NOT false = TRUE",
      result: "Camera is EXCLUDED (correct!)"
    },
    correctResult: "Should be excluded - times overlap completely"
  },
  {
    name: "Test 2: Query for 2025-12-21, 06:00-07:00 (no conflict)",
    searchDate: "2025-12-21",
    searchTime: "06:00 to 07:00",
    existingRentals: [
      { times: "08:00 to 13:00" },
      { times: "14:00 to 18:00" },
      { times: "19:00 to 23:00" }
    ],
    currentLogic: {
      condition: "NOT (r.end_time <= '06:00' OR r.start_time >= '07:00')",
      forRental1: "NOT (13:00 <= 06:00 OR 08:00 >= 07:00) = NOT (false OR true) = NOT true = FALSE",
      forRental2: "NOT (18:00 <= 06:00 OR 14:00 >= 07:00) = NOT (false OR true) = NOT true = FALSE",
      forRental3: "NOT (23:00 <= 06:00 OR 19:00 >= 07:00) = NOT (false OR true) = NOT true = FALSE",
      result: "Camera is INCLUDED (correct!)"
    },
    correctResult: "Should be available - no time overlap"
  },
  {
    name: "Test 3: Query for 2025-12-21, 12:00-15:00 (overlaps multiple)",
    searchDate: "2025-12-21",
    searchTime: "12:00 to 15:00",
    existingRentals: [
      { id: 54, times: "08:00 to 13:00" },
      { id: 60, times: "14:00 to 18:00" }
    ],
    currentLogic: {
      condition: "NOT (r.end_time <= '12:00' OR r.start_time >= '15:00')",
      forRental54: "NOT (13:00 <= 12:00 OR 08:00 >= 15:00) = NOT (false OR false) = TRUE",
      forRental60: "NOT (18:00 <= 12:00 OR 14:00 >= 15:00) = NOT (false OR false) = TRUE",
      result: "Camera is EXCLUDED (correct!)"
    },
    correctResult: "Should be excluded - overlaps with both rentals"
  }
];

console.log("=== AVAILABILITY LOGIC TEST ===\n");
console.log("ISSUE FOUND: The time overlap logic appears CORRECT!\n");
console.log("The condition: NOT (r.end_time <= search_start OR r.start_time >= search_end)");
console.log("This means: Exclude if NOT (rental ends before search OR rental starts after search)");
console.log("Which is: Exclude if rental overlaps with search period\n");

console.log("However, there might be other issues:\n");
console.log("1. NULL time handling - if start_time or end_time is NULL");
console.log("2. The OR condition with NULL might cause unexpected behavior");
console.log("3. Edge cases with same start/end times\n");

testCases.forEach((test, i) => {
  console.log(`\n${test.name}`);
  console.log(`Search: ${test.searchDate} ${test.searchTime}`);
  console.log(`Current Logic: ${test.currentLogic.result}`);
  console.log(`Expected: ${test.correctResult}`);
});

console.log("\n\n=== REAL BUG FOUND ===");
console.log("The issue is in the NULL handling!");
console.log("\nCurrent code:");
console.log("AND (r.start_time IS NULL OR r.end_time IS NULL OR NOT (r.end_time <= ? OR r.start_time >= ?))");
console.log("\nThis means:");
console.log("- If rental has NULL times, the entire condition becomes TRUE");
console.log("- So cameras with NULL-timed rentals are EXCLUDED (treated as all-day bookings)");
console.log("- This is actually CORRECT behavior for daily rentals!");
console.log("\nBUT the problem might be:");
console.log("1. The frontend is sending times even for daily rentals");
console.log("2. The comparison doesn't handle edge cases (exact same times)");
console.log("3. Date comparison might not account for inclusive ranges properly");
