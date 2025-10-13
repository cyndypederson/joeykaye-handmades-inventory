const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cyndypstitchcraft_db_user:4G2vcEQSjAvJoUxY@embroider-inventory.2x57teq.mongodb.net/?retryWrites=true&w=majority&appName=embroider-inventory';

async function createBackup() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const database = client.db('embroidery_inventory');
        
        // Fetch all collections
        const inventory = await database.collection('inventory').find({}).toArray();
        const customers = await database.collection('customers').find({}).toArray();
        const sales = await database.collection('sales').find({}).toArray();
        const gallery = await database.collection('gallery').find({}).toArray();
        const ideas = await database.collection('ideas').find({}).toArray();
        
        // Create backup directory with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
        const backupDir = path.join(__dirname, 'backups', `auto_backup_${timestamp}`);
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Save each collection to a file
        fs.writeFileSync(path.join(backupDir, 'inventory.json'), JSON.stringify(inventory, null, 2));
        fs.writeFileSync(path.join(backupDir, 'customers.json'), JSON.stringify(customers, null, 2));
        fs.writeFileSync(path.join(backupDir, 'sales.json'), JSON.stringify(sales, null, 2));
        fs.writeFileSync(path.join(backupDir, 'gallery.json'), JSON.stringify(gallery, null, 2));
        fs.writeFileSync(path.join(backupDir, 'ideas.json'), JSON.stringify(ideas, null, 2));
        
        // Create backup info file
        const backupInfo = {
            timestamp: new Date().toISOString(),
            counts: {
                inventory: inventory.length,
                customers: customers.length,
                sales: sales.length,
                gallery: gallery.length,
                ideas: ideas.length
            },
            backup_type: 'automatic'
        };
        
        fs.writeFileSync(path.join(backupDir, 'BACKUP_INFO.json'), JSON.stringify(backupInfo, null, 2));
        
        console.log(`✅ Backup created: ${backupDir}`);
        console.log(`📊 Backed up:`);
        console.log(`   - ${inventory.length} inventory items`);
        console.log(`   - ${customers.length} customers`);
        console.log(`   - ${sales.length} sales`);
        console.log(`   - ${gallery.length} gallery items`);
        console.log(`   - ${ideas.length} ideas`);
        
        // Keep only last 30 backups
        cleanupOldBackups();
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
    } finally {
        await client.close();
    }
}

function cleanupOldBackups() {
    const backupsDir = path.join(__dirname, 'backups');
    const backups = fs.readdirSync(backupsDir)
        .filter(dir => dir.startsWith('auto_backup_'))
        .map(dir => ({
            name: dir,
            path: path.join(backupsDir, dir),
            time: fs.statSync(path.join(backupsDir, dir)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Sort newest first
    
    // Keep only the 30 most recent backups
    if (backups.length > 30) {
        console.log(`🧹 Cleaning up old backups (keeping 30 most recent)...`);
        backups.slice(30).forEach(backup => {
            fs.rmSync(backup.path, { recursive: true, force: true });
            console.log(`   Removed: ${backup.name}`);
        });
    }
}

// Run backup
createBackup();
