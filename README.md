# GeoGuard - GIS-Based Government Land Protection & Encroachment Monitoring System

A comprehensive full-stack web application for monitoring and protecting government land in Tamil Nadu, India through advanced GIS mapping and encroachment detection.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Maps**: Leaflet.js + React-Leaflet
- **Backend**: Node.js + Express.js
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication (Email/Password)
- **Storage**: Firebase Storage (complaint photos)
- **CSV Processing**: csv-parser
- **PDF Generation**: PDFKit

## Features

### For Citizens
- Register and login with Aadhaar verification
- View personal land parcels
- File complaints with photo evidence
- Track complaint status in real-time
- Interactive GIS map with parcel visualization

### For Administrators
- Import land parcel data via CSV
- Manage land records with full CRUD operations
- Monitor all complaints and update status
- View comprehensive dashboard with statistics
- Advanced GIS mapping with multiple layers

## Project Structure

```
geoguard/
client/
  public/
  src/
    firebase/          # Firebase configuration
    context/           # Authentication context
    api/              # Axios configuration
    components/       # Reusable components
    pages/            # All page components
server/
  config/            # Firebase admin setup
  controllers/       # API controllers
  middleware/        # Auth and upload middleware
  routes/           # API routes
  utils/            # Helper functions
  seeders/          # Database seeders
```

## Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named "geoguard"
3. Enable Authentication with Email/Password provider
4. Enable Firestore Database (start in test mode)
5. Enable Storage (start in test mode)
6. Generate service account key:
   - Project Settings > Service Accounts > Generate New Private Key
   - Download the JSON file and save as `serviceAccountKey.json` in project root
7. Add Web App:
   - Project Settings > General > Your Apps > Add Web App
   - Copy Firebase config to client/.env

### 2. Environment Variables

**Client (.env)**:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

**Server (.env)**:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Service Account Key**:
1. Download the service account key JSON file from Firebase Console
2. Place it as `serviceAccountKey.json` in the project root directory or server directory

### 3. Installation & Running

**Backend**:
```bash
cd server
npm install
npm run seed  # Seed initial parcel data
npm run dev   # Start development server
```

**Frontend**:
```bash
cd client
npm install
npm run dev   # Start development server
```

### 4. Create Admin User

1. Register a new account on the web app
2. Go to Firebase Console > Firestore > users collection
3. Find your user document and change `role` from "citizen" to "admin"
4. Log out and log back in

## URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Map View: http://localhost:5173/map
- CSV Import: http://localhost:5173/import
- Admin Dashboard: http://localhost:5173/admin

## Database Collections

### users
```javascript
{
  uid: "firebase_auth_uid",
  name: "Murugan Rajan",
  email: "murugan@gmail.com",
  phone: "9876543210",
  aadhaar_last4: "1234",
  role: "citizen", // or "admin"
  created_at: "ISO string"
}
```

### land_parcels
```javascript
{
  survey_no: "1/1A",
  sub_division: "1A",
  ulpin: "PALLAV001A",
  village_lgd_code: "627845",
  patta_no: "PTT-PA001",
  owner_name: "Arumugam Selvam",
  area_acres: 0.45,
  district: "Chengalpattu",
  taluk: "Pallavaram",
  village: "Zamin Pallavaram",
  land_type: "private", // private, government, poramboke, forest
  status: "clear", // clear, encroached, disputed, government
  centroid_lat: 12.9721,
  centroid_lng: 80.1512,
  geojson_coordinates: { type: "Polygon", coordinates: [[...]] },
  created_at: "ISO string",
  updated_at: "ISO string"
}
```

### complaints
```javascript
{
  user_id: "firebase_uid",
  user_name: "Murugan Rajan",
  survey_no: "1/1A",
  description: "Illegal construction on government land",
  photo_url: "https://storage.googleapis.com/...",
  lat: 12.9721,
  lng: 80.1512,
  status: "open", // open, in_review, resolved
  admin_remarks: "",
  created_at: "ISO string",
  updated_at: "ISO string"
}
```

## CSV Import Format

Download the template from the import page or use this format:

```csv
district,taluk,village,survey_no,sub_division,land_type,centroid_lat,centroid_lng,village_lgd_code,ulpin,patta_no,owner_name,area_acres
Chengalpattu,Pallavaram,Zamin Pallavaram,1,1A,private,12.9721,80.1512,627845,PALLAV001A,PTT-PA001,Arumugam Selvam,0.45
```

**Required fields**: district, taluk, village, survey_no, sub_division, land_type, centroid_lat, centroid_lng

**Land types**: private, government, poramboke, forest

**Coordinates**: Must be within Tamil Nadu bounds (Lat: 8.07-13.57, Lng: 76.23-80.33)

## API Endpoints

### Parcels
- GET `/api/parcels` - Get all parcels
- GET `/api/parcels/:surveyNo` - Get parcel by survey number
- POST `/api/parcels` - Add new parcel (admin only)
- PUT `/api/parcels/:id` - Update parcel (admin only)
- DELETE `/api/parcels/:id` - Delete parcel (admin only)
- POST `/api/parcels/upload-csv` - Upload CSV file (admin only)

### Complaints
- GET `/api/complaints` - Get all complaints (admin only)
- GET `/api/complaints/mine` - Get my complaints
- POST `/api/complaints` - File new complaint
- PUT `/api/complaints/:id` - Update complaint (admin only)

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /land_parcels/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /complaints/{docId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (resource.data.user_id == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Map Features

- **Base Maps**: Street (CartoDB), Satellite (ESRI), Terrain (OpenTopoMap)
- **Layers**: Cadastral parcels, encroachment zones, ownership, complaints, village boundaries
- **Bhuvan WMS**: Real Tamil Nadu cadastral boundaries integration
- **Interactive**: Click parcels for details, fly to locations, coordinate tracking
- **Color Coding**: 
  - Private land: Yellow
  - Government land: Blue
  - Poramboke land: Purple
  - Forest land: Green
  - Encroached: Red border
  - Disputed: Orange border

## Deployment

### Frontend (Vercel/Netlify)

1. **Install dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Environment variables** (set in deployment platform):
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. **Build and deploy**:
   ```bash
   npm run build
   # Deploy the dist/ folder to Vercel/Netlify
   ```

### Backend (Heroku/Render)

1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Environment variables** (set in deployment platform):
   ```
   NODE_ENV=production
   PORT=5000
   ```

3. **Deploy**:
   ```bash
   # Deploy to Heroku/Render
   git push heroku main
   # or use Render dashboard
   ```

### Firebase Setup

1. **Create Firebase Project**: [Firebase Console](https://console.firebase.google.com)
2. **Enable Authentication**: Email/Password
3. **Create Firestore Database**
4. **Setup Security Rules**: Copy from `firestore.rules`
5. **Generate Service Account Key**: Download and save as `serviceAccountKey.json`
6. **Update Environment Variables** with Firebase config

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for automated deployment:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install and Build Frontend
        run: |
          cd client
          npm install
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.

---

**GeoGuard** - Protecting Tamil Nadu's land resources through technology.
