#!/bin/bash

# Setup script for Joey Kaye Handmades - Local Development

echo "🏠 Joey Kaye Handmades - Local Setup"
echo "====================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to overwrite it? (y/n): " OVERWRITE
    if [ "$OVERWRITE" != "y" ] && [ "$OVERWRITE" != "Y" ]; then
        echo "✓ Keeping existing .env file"
    else
        echo "📝 Creating new .env file..."
        cat > .env << 'EOF'
# Joey Kaye Handmades - Environment Variables

# MongoDB Connection (using same cluster as Embroidery project)
MONGODB_URI=mongodb+srv://cyndypstitchcraft_db_user:4G2vcEQSjAvJoUxY@embroider-inventory.2x57teq.mongodb.net/?retryWrites=true&w=majority&appName=embroider-inventory

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password2025

# Session Secret
SESSION_SECRET=joeykaye-secret-key-2025

# Server Port
PORT=3003

# Node Environment
NODE_ENV=development
EOF
        echo "✅ .env file created"
    fi
else
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Joey Kaye Handmades - Environment Variables

# MongoDB Connection (using same cluster as Embroidery project)
MONGODB_URI=mongodb+srv://cyndypstitchcraft_db_user:4G2vcEQSjAvJoUxY@embroider-inventory.2x57teq.mongodb.net/?retryWrites=true&w=majority&appName=embroider-inventory

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password2025

# Session Secret
SESSION_SECRET=joeykaye-secret-key-2025

# Server Port
PORT=3003

# Node Environment
NODE_ENV=development
EOF
    echo "✅ .env file created"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 To start the server:"
    echo "   npm start"
    echo ""
    echo "   Or with PM2:"
    echo "   npm run pm2:start"
    echo ""
    echo "📱 Access the app at:"
    echo "   http://localhost:3003"
    echo ""
    echo "🔐 Login credentials:"
    echo "   Username: admin"
    echo "   Password: password2025"
else
    echo ""
    echo "❌ Failed to install dependencies"
fi

