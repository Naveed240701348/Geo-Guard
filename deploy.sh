#!/bin/bash

# GeoGuard Deployment Script
# This script helps deploy the GeoGuard application to GitHub and production

echo "=== GeoGuard Deployment Script ==="
echo "This will help you deploy your application to GitHub and production"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    echo "Git repository initialized!"
else
    echo "Git repository already exists!"
fi

# Add all files to git
echo "Adding files to Git..."
git add .

# Commit changes
echo "Creating initial commit..."
git commit -m "Initial commit: Complete GeoGuard GIS Land Protection System

Features:
- Full-stack React + Node.js application
- Firebase authentication and database
- Interactive GIS mapping with Leaflet.js
- Land parcel management and CSV import
- Complaint filing and tracking system
- Role-based access control (citizen/admin)
- Real-time search and filtering
- Responsive design with Tailwind CSS

Tech Stack:
- Frontend: React, Vite, Tailwind CSS, Leaflet.js
- Backend: Node.js, Express.js, Firebase Admin SDK
- Database: Firebase Firestore with security rules
- Authentication: Firebase Auth with email/password
- Storage: Firebase Storage for file uploads"

# Check if GitHub remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/username/geoguard.git"
    read -p "GitHub URL: " github_url
    
    if [ ! -z "$github_url" ]; then
        git remote add origin $github_url
        echo "Remote 'origin' added to GitHub repository!"
    else
        echo "No GitHub URL provided. You can add it later with:"
        echo "git remote add origin https://github.com/username/geoguard.git"
    fi
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
if git remote get-url origin > /dev/null 2>&1; then
    git push -u origin main
    echo "Code pushed to GitHub successfully!"
else
    echo "No remote repository configured. Please add GitHub remote and push manually."
fi

echo ""
echo "=== Deployment Instructions ==="
echo ""
echo "1. FRONTEND DEPLOYMENT (Vercel/Netlify):"
echo "   - Go to Vercel.com or Netlify.com"
echo "   - Import your GitHub repository"
echo "   - Set environment variables from client/.env"
echo "   - Deploy the 'client' folder"
echo ""
echo "2. BACKEND DEPLOYMENT (Heroku/Render):"
echo "   - Go to Heroku.com or Render.com"
echo "   - Create new Node.js app"
echo "   - Connect your GitHub repository"
echo "   - Set build command: 'cd server && npm install'"
echo "   - Set start command: 'cd server && npm start'"
echo "   - Add environment variables from server/.env"
echo ""
echo "3. FIREBASE SETUP:"
echo "   - Create Firebase project at console.firebase.google.com"
echo "   - Enable Authentication (Email/Password)"
echo "   - Create Firestore Database"
echo "   - Upload serviceAccountKey.json to deployment"
echo "   - Copy firestore.rules to Firebase Security Rules"
echo ""
echo "4. UPDATE CONFIGURATION:"
echo "   - Update client/.env with your Firebase config"
echo "   - Update server/.env with production values"
echo "   - Update API URLs in deployment platforms"
echo ""
echo "=== Next Steps ==="
echo "1. Visit your GitHub repository to verify code is uploaded"
echo "2. Deploy frontend to Vercel/Netlify"
echo "3. Deploy backend to Heroku/Render"
echo "4. Configure Firebase"
echo "5. Test your deployed application!"
echo ""
echo "=== Important Notes ==="
echo "- Never commit serviceAccountKey.json to public repositories"
echo "- Use environment variables for all sensitive data"
echo "- Test thoroughly in production environment"
echo "- Monitor Firebase usage and costs"
echo ""
echo "Deployment script completed! Your GeoGuard application is ready for production."
