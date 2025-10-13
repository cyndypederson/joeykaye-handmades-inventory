# Joey Kaye Handmades - Setup Instructions

## MongoDB Setup

You can use the same MongoDB Atlas cluster as your Embroidery project. The app will create a separate database called `joeykaye_handmades`.

**MongoDB Connection String:**
```
mongodb+srv://cyndypstitchcraft_db_user:4G2vcEQSjAvJoUxY@embroider-inventory.2x57teq.mongodb.net/?retryWrites=true&w=majority&appName=embroider-inventory
```

## Local Development Setup

1. **Create .env file** in the project root:
   ```bash
   MONGODB_URI=mongodb+srv://cyndypstitchcraft_db_user:4G2vcEQSjAvJoUxY@embroider-inventory.2x57teq.mongodb.net/?retryWrites=true&w=majority&appName=embroider-inventory
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=password2025
   SESSION_SECRET=joeykaye-secret-key-2025
   PORT=3003
   NODE_ENV=development
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server locally:**
   ```bash
   npm start
   # Or with PM2:
   npm run pm2:start
   ```

4. **Access the app:**
   - Local: http://localhost:3003
   - Login: admin / password2025

## GitHub Repository Setup

1. **Create repository on GitHub:**
   - Go to: https://github.com/new
   - Repository name: `joeykaye-handmades-inventory`
   - Set to Private (recommended)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push to GitHub:**
   ```bash
   cd /Users/cyndyp/Desktop/Projects/JoeyKayeHandmades
   git remote add origin https://github.com/YOUR_USERNAME/joeykaye-handmades-inventory.git
   git push -u origin main
   ```

## Vercel Deployment

1. **Deploy to Vercel:**
   - Go to: https://vercel.com/new
   - Import your GitHub repository: `joeykaye-handmades-inventory`
   - Click "Import"

2. **Add Environment Variables in Vercel:**
   - In Vercel project settings → Environment Variables, add:
     ```
     MONGODB_URI=mongodb+srv://cyndypstitchcraft_db_user:4G2vcEQSjAvJoUxY@embroider-inventory.2x57teq.mongodb.net/?retryWrites=true&w=majority&appName=embroider-inventory
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=password2025
     SESSION_SECRET=joeykaye-secret-key-2025
     NODE_ENV=production
     ```

3. **Deploy:**
   - Click "Deploy"
   - Your app will be live at: `https://joeykaye-handmades-inventory.vercel.app`

## Both Apps Running Simultaneously

You can run both apps at the same time:
- **Embroidery App:** http://localhost:3002
- **Joey Kaye App:** http://localhost:3003

Both apps will use the same MongoDB cluster but different databases:
- Embroidery: `embroidery_inventory`
- Joey Kaye: `joeykaye_handmades`

