#!/bin/bash

# Setup script for Joey Kaye Handmades GitHub Repository

echo "🚀 Joey Kaye Handmades - GitHub Setup"
echo "======================================"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

REPO_NAME="joeykaye-handmades-inventory"
REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo "📋 Please create a new GitHub repository first:"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: $REPO_NAME"
echo "   3. Set to Private (recommended)"
echo "   4. Do NOT initialize with README"
echo "   5. Click 'Create repository'"
echo ""

read -p "Have you created the repository? (y/n): " CREATED

if [ "$CREATED" != "y" ] && [ "$CREATED" != "Y" ]; then
    echo "❌ Please create the repository first, then run this script again"
    exit 1
fi

echo ""
echo "🔗 Adding remote repository..."
git remote add origin "$REPO_URL"

if [ $? -ne 0 ]; then
    echo "⚠️  Remote already exists, updating..."
    git remote set-url origin "$REPO_URL"
fi

echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Go to: https://vercel.com/new"
    echo "   2. Import repository: $REPO_NAME"
    echo "   3. Add environment variables (see SETUP_INSTRUCTIONS.md)"
    echo "   4. Deploy!"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "   Please check your credentials and repository URL"
fi

