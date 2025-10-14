# Testing Notes for Joey Kaye Handmades

## Testing Data Protocol

### When Adding Test Data:
**ALWAYS test the complete workflow by also testing deletion:**

1. **Add test data** - Create sample customers, inventory items, projects, etc.
2. **Verify data appears** - Check that the data shows up correctly in the UI
3. **Test deletion** - Delete the test data you just created
4. **Verify cleanup** - Confirm the data is removed from UI and database
5. **Check console** - Ensure no errors occur during deletion

### Why This Is Important:
- **Prevents data accumulation** - Test data doesn't clutter the database
- **Verifies delete functionality** - Ensures delete operations work correctly
- **Tests UI updates** - Confirms the interface refreshes properly after deletions
- **Catches console errors** - Identifies issues like the recent `loadCustomersTable()` error
- **Complete workflow testing** - Tests the full add → view → delete cycle

### Recent Example:
The customer deletion console error (`Cannot set properties of null (setting 'innerHTML')`) was discovered when testing deletion after adding test data. This led to fixing:
- Wrong function calls (`loadCustomersTable()` → `loadCustomersCards()`)
- Missing DOM element references
- Operator precedence issues in conditions

### Best Practice:
**Every test data creation should end with test data deletion.**

---
*Note added: October 14, 2025*
