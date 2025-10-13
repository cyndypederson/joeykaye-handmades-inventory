const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'MONGODB_URI_REQUIRED';
const DB_NAME = 'joeykaye_handmades';
let db;

// Connect to MongoDB (lazy connection)
async function connectToDatabase() {
    if (db) return db; // Already connected
    
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        const client = new MongoClient(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            connectTimeoutMS: 5000,
        });
        await client.connect();
        db = client.db(DB_NAME);
        console.log('✅ Connected to MongoDB Atlas');
        
        // Initialize collections with sample data if empty
        await initializeCollections();
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('❌ Full error:', error);
        return null;
    }
}

// Initialize collections with sample data
async function initializeCollections() {
    try {
        // Check if inventory collection is empty
        const inventoryCount = await db.collection('inventory').countDocuments();
        if (inventoryCount === 0) {
            // Load sample data from files
            const fs = require('fs');
            const inventoryPath = path.join(__dirname, 'data', 'inventory.json');
            const customersPath = path.join(__dirname, 'data', 'customers.json');
            const salesPath = path.join(__dirname, 'data', 'sales.json');
            const galleryPath = path.join(__dirname, 'data', 'gallery.json');
            
            if (fs.existsSync(inventoryPath)) {
                const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
                await db.collection('inventory').insertMany(inventoryData);
                console.log('📦 Loaded inventory sample data');
            }
            
            if (fs.existsSync(customersPath)) {
                const customersData = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
                await db.collection('customers').insertMany(customersData);
                console.log('👥 Loaded customers sample data');
            }
            
            if (fs.existsSync(salesPath)) {
                const salesData = JSON.parse(fs.readFileSync(salesPath, 'utf8'));
                await db.collection('sales').insertMany(salesData);
                console.log('💰 Loaded sales sample data');
            }
            
            if (fs.existsSync(galleryPath)) {
                const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
                await db.collection('gallery').insertMany(galleryData);
                console.log('🖼️ Loaded gallery sample data');
            }
            
            // Initialize ideas collection (empty by default)
            const ideasCount = await db.collection('ideas').countDocuments();
            if (ideasCount === 0) {
                console.log('💡 Ideas collection initialized');
            }
        }
    } catch (error) {
        console.error('Error initializing collections:', error);
    }
}

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increase payload limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Add URL encoded support

// Session middleware
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'embroidery-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for local development (http)
        httpOnly: true,
        sameSite: 'lax', // Required for modern browsers
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// NUCLEAR CACHE CONTROL - Force no caching whatsoever
app.use((req, res, next) => {
    // Force no cache for all files to prevent version mismatches
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private, no-transform');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${Date.now()}-${Math.random()}"`);
    res.setHeader('Vary', '*');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Accel-Expires', '0');
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-Lookup', 'MISS');
    
    // Add timestamp to all responses
    res.locals.timestamp = Date.now();
    res.locals.random = Math.random().toString(36).substring(7);
    
    next();
});

// Special endpoint for script.js with aggressive cache busting
app.get('/script.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private, no-transform');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${Date.now()}-${Math.random()}"`);
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.use(express.static(path.join(__dirname)));

// Version check endpoint for debugging
app.get('/version.json', (req, res) => {
    const packageJson = require('./package.json');
    res.json({
        version: packageJson.version,
        timestamp: new Date().toISOString(),
        build: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve the main HTML file with NUCLEAR cache busting
app.get('/', (req, res) => {
    // Add timestamp to response headers
    res.setHeader('X-Timestamp', res.locals.timestamp);
    res.setHeader('X-Random', res.locals.random);
    res.setHeader('X-Cache-Bust', `${res.locals.timestamp}-${res.locals.random}`);
    
    // Always redirect with fresh cache bust parameters to force reload
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return res.redirect(`/?cb=${timestamp}&r=${random}&v=1.0.12&force=${timestamp}`);
});

// Health check endpoint
app.get('/health', async (req, res) => {
    const database = await connectToDatabase();
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: database ? 'Connected' : 'Disconnected'
    });
});

// Authentication endpoints
// Default admin credentials (should be changed in production)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kobedavis#1';

// Check auth status
app.get('/api/auth/status', (req, res) => {
    console.log('🔍 Server auth status check:', { 
        sessionID: req.sessionID,
        authenticated: req.session && req.session.authenticated,
        username: req.session && req.session.username,
        sessionExists: !!req.session
    });
    res.json({
        authenticated: req.session && req.session.authenticated === true,
        username: req.session && req.session.username,
        authEnabled: true
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('🔐 Server login attempt:', { username, password: password ? password.substring(0, 3) + '***' : 'undefined' });
    console.log('🔐 Expected credentials:', { username: ADMIN_USERNAME, password: ADMIN_PASSWORD ? ADMIN_PASSWORD.substring(0, 3) + '***' : 'undefined' });
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        console.log('✅ Server login successful, setting session');
        req.session.authenticated = true;
        req.session.username = username;
        console.log('🔐 Session after login:', { 
            authenticated: req.session.authenticated, 
            username: req.session.username,
            sessionID: req.sessionID 
        });
        res.json({
            success: true,
            message: 'Login successful',
            username: username
        });
    } else {
        console.log('❌ Server login failed');
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        } else {
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        }
    });
});

// API endpoints for data persistence
app.get('/api/inventory', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        const inventory = await database.collection('inventory').find({}).toArray();
        res.json(inventory);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory data' });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        await database.collection('inventory').deleteMany({});
        if (req.body && req.body.length > 0) {
            await database.collection('inventory').insertMany(req.body);
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving inventory:', error);
        res.status(500).json({ error: 'Failed to save inventory data' });
    }
});

// Update individual inventory item
app.put('/api/inventory/:id', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        
        const { id } = req.params;
        const updateData = req.body;
        
        const result = await database.collection('inventory').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
});

app.get('/api/customers', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        const customers = await database.collection('customers').find({}).toArray();
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers data' });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        await database.collection('customers').deleteMany({});
        if (req.body && req.body.length > 0) {
            await database.collection('customers').insertMany(req.body);
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving customers:', error);
        res.status(500).json({ error: 'Failed to save customers data' });
    }
});

app.get('/api/sales', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        const sales = await database.collection('sales').find({}).toArray();
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: 'Failed to fetch sales data' });
    }
});

app.post('/api/sales', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        await database.collection('sales').deleteMany({});
        if (req.body && req.body.length > 0) {
            await database.collection('sales').insertMany(req.body);
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving sales:', error);
        res.status(500).json({ error: 'Failed to save sales data' });
    }
});

app.get('/api/gallery', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        const gallery = await database.collection('gallery').find({}).toArray();
        res.json(gallery);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Failed to fetch gallery data' });
    }
});

app.post('/api/gallery', async (req, res) => {
    try {
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        await database.collection('gallery').deleteMany({});
        if (req.body && req.body.length > 0) {
            await database.collection('gallery').insertMany(req.body);
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving gallery:', error);
        res.status(500).json({ error: 'Failed to save gallery data' });
    }
});

app.get('/api/ideas', async (req, res) => {
    try {
        console.log('📖 Server: Fetching ideas from database');
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        const ideas = await database.collection('ideas').find({}).toArray();
        console.log('📖 Server: Found', ideas.length, 'ideas in database');
        res.json(ideas);
    } catch (error) {
        console.error('Error fetching ideas:', error);
        res.status(500).json({ error: 'Failed to fetch ideas data' });
    }
});

app.post('/api/ideas', async (req, res) => {
    try {
        console.log('💾 Server: Saving ideas, count:', req.body ? req.body.length : 'no body');
        const database = await connectToDatabase();
        if (!database) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        await database.collection('ideas').deleteMany({});
        console.log('💾 Server: Cleared all ideas from database');
        if (req.body && req.body.length > 0) {
            await database.collection('ideas').insertMany(req.body);
            console.log('💾 Server: Inserted', req.body.length, 'ideas into database');
        } else {
            console.log('💾 Server: No ideas to insert (empty body)');
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving ideas:', error);
        res.status(500).json({ error: 'Failed to save ideas data' });
    }
});

// Connect to database and start server
connectToDatabase().then(() => {
    // Start server only if not in Vercel environment
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
        app.listen(PORT, () => {
            console.log(`\n🚀 Embroidery Inventory Manager Server Running!`);
            console.log(`   Local:   http://localhost:${PORT}`);
            console.log(`   Network: http://${getLocalIP()}:${PORT}`);
            console.log(`\n📱 Access from any device on your network using the Network URL`);
        });
    }
});

function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// Export for Vercel
module.exports = app;