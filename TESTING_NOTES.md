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

## Version Management Protocol

### When to Update Version:
**ALWAYS update the version number when:**
1. **Pushing to live production** - Any changes that go to the live Vercel site
2. **Any Git push** - Even small fixes or documentation updates
3. **Before deployment** - Update version first, then commit and push

### Version Update Locations:
1. **`package.json`** - Main version number
2. **`index.html`** - Meta tag and title
3. **`script.js`** - `updateVersionDisplay()` and `checkWebUpdates()` functions

### Version Bump Strategy:
- **Patch (1.1.x)** - Bug fixes, small improvements
- **Minor (1.x.0)** - New features, significant changes
- **Major (x.0.0)** - Breaking changes, major rewrites

### Example Workflow:
```bash
# 1. Update version in all files
# 2. Test locally
# 3. Commit with version in message
git commit -m "v1.1.3: Fix customer deletion error"
# 4. Push to trigger deployment
git push origin main
```

### Why This Matters:
- **Cache busting** - Forces browsers to load new versions
- **Deployment tracking** - Easy to see what's deployed
- **Rollback reference** - Know which version to revert to
- **User feedback** - Users can report specific version issues

---
*Note added: October 14, 2025*
