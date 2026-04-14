const fs = require('fs');

// Read the service account key file
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

// Generate environment variables for Render
const envVars = `
# Firebase Environment Variables for Render
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"
FIREBASE_CLIENT_ID=${serviceAccount.client_id}
FIREBASE_AUTH_URI=${serviceAccount.auth_uri}
FIREBASE_TOKEN_URI=${serviceAccount.token_uri}
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${serviceAccount.auth_provider_x509_cert_url}
FIREBASE_CLIENT_X509_CERT_URL=${serviceAccount.client_x509_cert_url}
`;

console.log('=== Firebase Environment Variables for Render ===');
console.log('');
console.log('Copy these environment variables to your Render dashboard:');
console.log('');
console.log(envVars);
console.log('');
console.log('=== Instructions ===');
console.log('1. Go to your Render service dashboard');
console.log('2. Click on "Environment" tab');
console.log('3. Add each environment variable from above');
console.log('4. Make sure to include the quotes around the private key!');
console.log('5. Redeploy your service');
console.log('');
console.log('=== Alternative: File Upload ===');
console.log('If you prefer file upload instead of environment variables:');
console.log('1. Upload serviceAccountKey.json to Render');
console.log('2. Set environment variable: FIREBASE_USE_FILE=true');
console.log('3. The app will automatically use the file instead');
