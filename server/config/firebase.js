const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Try environment variables first (for production)
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  console.log('Using Firebase config from environment variables');
  var serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_id: process.env.FIREBASE_CLIENT_ID
  };
} else {
  // Fallback to service account key file (for development)
  const possiblePaths = [
    path.join(__dirname, '../../serviceAccountKey.json'),
    path.join(__dirname, '../../../serviceAccountKey.json'),
    'C:/Users/naveed sheriff j/OneDrive/Desktop/Geo_Guard/serviceAccountKey.json',
    './serviceAccountKey.json',
    '../serviceAccountKey.json'
  ];

  let keyPath = '';
  for (const possiblePath of possiblePaths) {
    try {
      if (fs.existsSync(possiblePath)) {
        serviceAccount = require(possiblePath);
        keyPath = possiblePath;
        break;
      }
    } catch (error) {
      // Continue to next path
    }
  }

  if (!serviceAccount) {
    console.error('Service account key not found and environment variables not set');
    console.error('Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, etc. in environment variables');
    process.exit(1);
  }

  console.log('Using service account key from:', keyPath);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db      = admin.firestore();
const storage = admin.storage();
const auth    = admin.auth();

module.exports = { admin, db, storage, auth };
