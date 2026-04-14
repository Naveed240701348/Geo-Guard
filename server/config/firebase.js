const admin = require('firebase-admin');
const path = require('path');

// Try to load service account key from multiple possible locations
let serviceAccount;

const possiblePaths = [
  path.join(__dirname, '../serviceAccountKey.json'),
  path.join(__dirname, '../../serviceAccountKey.json'),
  './serviceAccountKey.json',
  'serviceAccountKey.json'
];

for (const servicePath of possiblePaths) {
  try {
    serviceAccount = require(servicePath);
    break;
  } catch (e) {
    // Continue to next path
  }
}

if (!serviceAccount) {
  console.error('Service account key not found. Please place serviceAccountKey.json in the project root or server directory.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db      = admin.firestore();
const storage = admin.storage();
const auth    = admin.auth();

module.exports = { admin, db, storage, auth };
