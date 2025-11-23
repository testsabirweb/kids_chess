#!/bin/bash

# GitHub Pages Setup Script for Chess for Toddlers
# This script prepares your project for GitHub Pages deployment

set -e

echo "🎯 GitHub Pages Setup for Chess for Toddlers"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "app" ]; then
    echo "❌ Error: 'app' directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "📋 Step 1: Preparing files for GitHub Pages..."
echo ""

# Ask if user wants to move files to root (recommended for GitHub Pages)
read -p "Move files from /app to root? (Recommended for GitHub Pages) [y/N]: " move_files

if [[ $move_files =~ ^[Yy]$ ]]; then
    echo "📦 Moving files to root directory..."
    
    # Move files from app/ to root
    if [ -f "app/index.html" ]; then
        cp app/index.html index.html
        echo "  ✓ Copied index.html"
    fi
    if [ -f "app/styles.css" ]; then
        cp app/styles.css styles.css
        echo "  ✓ Copied styles.css"
    fi
    if [ -f "app/script.js" ]; then
        cp app/script.js script.js
        echo "  ✓ Copied script.js"
    fi
    
    # Update paths in index.html if needed (they should already be correct)
    echo "  ✓ Files ready in root directory"
    echo ""
    echo "${GREEN}✓ Files are now in root directory${NC}"
    echo "  Your GitHub Pages site will be at: https://YOUR_USERNAME.github.io/REPO_NAME/"
else
    echo "📁 Keeping files in /app directory"
    echo "  You'll need to configure GitHub Pages to serve from /app folder"
    echo "  Or your site will be at: https://YOUR_USERNAME.github.io/REPO_NAME/app/"
fi

echo ""
echo "📋 Step 2: Creating .gitignore..."
cat > .gitignore << 'EOF'
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log

# OS files
Thumbs.db
EOF
echo "${GREEN}✓ Created .gitignore${NC}"

echo ""
echo "📋 Step 3: Creating README.md..."
cat > README.md << 'EOF'
# Chess for Toddlers ♟️

A simple, offline-capable web app that teaches basic chess piece movement to young children on touch devices.

## 🎮 Features

- **6 Chess Pieces**: Rook, Bishop, Queen, King, Knight, Pawn
- **Visual Learning**: Tap a piece to see its legal moves highlighted on a 5×5 board
- **Mini-Game**: "Find the ⭐" - locate the star on a random legal square
- **Rewards**: Collect stickers for finding stars; celebrate after 5 wins!
- **Accessibility**: Large tap targets, high contrast, screen reader support
- **Responsive**: Works on phones, tablets, and desktop

## 🚀 Live Demo

Visit the live site: [Your GitHub Pages URL]

## 📱 How to Use

1. Open `index.html` in any modern web browser
2. Select a chess piece to see its moves
3. Tap "Play" to start the mini-game
4. Find the ⭐ and tap it to earn stickers!

## 🛠️ Technology

- Pure HTML/CSS/JavaScript (no frameworks)
- Uses Unicode chess pieces (♖ ♗ ♕ ♔ ♘ ♙)
- WebAudio API for sounds
- Vibration API for haptic feedback (mobile)
- Pure DOM animations for confetti
- Fully offline-capable

## 📄 License

Free to use and modify for educational purposes.

---

Made with ❤️ for toddlers learning chess!
EOF
echo "${GREEN}✓ Created README.md${NC}"

echo ""
echo "📋 Step 4: Initializing Git repository..."
if [ -d ".git" ]; then
    echo "${YELLOW}⚠ Git repository already exists${NC}"
    read -p "Continue anyway? [y/N]: " continue_anyway
    if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 0
    fi
else
    git init
    echo "${GREEN}✓ Git repository initialized${NC}"
fi

echo ""
echo "📋 Step 5: Adding files to Git..."
git add .
echo "${GREEN}✓ Files staged${NC}"

echo ""
echo "=============================================="
echo "${GREEN}✅ Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Name it (e.g., 'chess-for-toddlers')"
echo "   - Make it ${YELLOW}PUBLIC${NC} (required for free GitHub Pages)"
echo "   - Don't initialize with README (we already have one)"
echo ""
echo "2. Connect and push your code:"
echo "   ${BLUE}git commit -m 'Initial commit - Chess for Toddlers'${NC}"
echo "   ${BLUE}git branch -M main${NC}"
echo "   ${BLUE}git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to your repository on GitHub"
echo "   - Click 'Settings' → 'Pages'"
if [[ $move_files =~ ^[Yy]$ ]]; then
    echo "   - Source: Select 'Deploy from a branch'"
    echo "   - Branch: Select 'main' and '/ (root)'"
else
    echo "   - Source: Select 'Deploy from a branch'"
    echo "   - Branch: Select 'main' and '/app'"
fi
echo "   - Click 'Save'"
echo ""
echo "4. Your site will be live at:"
if [[ $move_files =~ ^[Yy]$ ]]; then
    echo "   ${GREEN}https://YOUR_USERNAME.github.io/REPO_NAME/${NC}"
else
    echo "   ${GREEN}https://YOUR_USERNAME.github.io/REPO_NAME/app/${NC}"
fi
echo ""
echo "⏱️  It may take 1-2 minutes for the site to be available"
echo ""
echo "${YELLOW}Note:${NC} Replace YOUR_USERNAME and REPO_NAME with your actual GitHub username and repository name!"
echo ""

