# Joey Kaye Handmades Inventory Manager

A web-based inventory management system specifically designed for Joey Kaye Handmades, featuring yarn tracking for handmade craft projects.

## Features

- **Project Management**: Track handmade projects with status, priority, and due dates
- **Yarn Tracking**: Record yarn color and amount for each project
- **Customer Management**: Organize projects by customer
- **Inventory Tracking**: Manage supplies and materials
- **Gallery**: Showcase completed projects
- **Ideas Board**: Save inspiration and project ideas
- **Sales Tracking**: Monitor sales and revenue
- **Mobile Friendly**: Responsive design works on phones and tablets

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your configuration:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_password
   SESSION_SECRET=your_secret_key
   PORT=3003
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Or use PM2 for production:
   ```bash
   npm run pm2:start
   ```

## Local Access

- Local: http://localhost:3003
- Network: http://YOUR_LOCAL_IP:3003

## Deployment

This app is configured for deployment on Vercel with MongoDB Atlas as the database.

## Version

Current version: 1.0.0

