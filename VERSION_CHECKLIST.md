# Version Update Checklist

## Before Every Git Push / Live Release

### ✅ Required Version Updates:

1. **`package.json`**
   ```json
   "version": "1.1.3"
   ```

2. **`index.html`**
   ```html
   <meta name="version" content="1.1.3">
   <title>Joey Kaye Handmades Inventory - v1.1.3</title>
   <link rel="stylesheet" href="styles.css?v=1.1.3">
   <script src="script.js?v=1.1.3&t=..."></script>
   ```

3. **`script.js`**
   ```javascript
   // In updateVersionDisplay() function
   const currentVersion = '1.1.3';
   
   // In checkWebUpdates() function  
   const currentVersion = '1.1.3';
   ```

### 🔄 Version Bump Rules:

- **Patch (1.1.x)** - Bug fixes, small improvements, documentation
- **Minor (1.x.0)** - New features, UI changes, significant improvements  
- **Major (x.0.0)** - Breaking changes, complete rewrites

### 📝 Commit Message Format:
```bash
git commit -m "v1.1.3: Brief description of changes"
```

### 🚀 Deployment Workflow:
1. Update version in all 3 locations
2. Test locally
3. Commit with version in message
4. Push to GitHub (triggers Vercel)
5. Monitor deployment

---
**Remember: Every Git push = Version bump!**

