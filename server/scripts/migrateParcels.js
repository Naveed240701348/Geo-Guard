const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const COLLECTION = 'land_parcels';

async function migrateParcels() {
  try {
    console.log('=== Parcel Migration Started ===');
    
    // Get all existing parcels
    const snapshot = await db.collection(COLLECTION).get();
    const parcels = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${parcels.length} parcels to migrate`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const parcel of parcels) {
      try {
        const updateData = {};
        
        // Map old field names to new field names
        if (parcel.survey_no && !parcel.survey_number) {
          updateData.survey_number = parcel.survey_no;
          delete updateData.survey_no;
        }
        
        if (parcel.centroid_lat && !parcel.latitude) {
          updateData.latitude = parcel.centroid_lat;
        }
        
        if (parcel.centroid_lng && !parcel.longitude) {
          updateData.longitude = parcel.centroid_lng;
        }
        
        // Set default values for missing required fields
        if (!parcel.district) {
          updateData.district = 'Chengalpattu';
        }
        
        if (!parcel.taluk) {
          updateData.taluk = 'Pallavaram';
        }
        
        if (!parcel.village) {
          updateData.village = 'Zamin Pallavaram';
        }
        
        // Ensure status is one of the valid values
        if (parcel.status && parcel.status === 'clear') {
          updateData.status = 'active';
        }
        
        // Remove unwanted fields
        const unwantedFields = ['ulpin', 'village_lgd_code', 'patta_no', 'owner_name'];
        const deleteData = {};
        
        for (const field of unwantedFields) {
          if (parcel[field] !== undefined) {
            deleteData[field] = admin.firestore.FieldValue.delete();
          }
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length > 0 || Object.keys(deleteData).length > 0) {
          const batch = db.batch();
          const docRef = db.collection(COLLECTION).doc(parcel.id);
          
          // Add updates
          if (Object.keys(updateData).length > 0) {
            batch.update(docRef, updateData);
          }
          
          // Add deletions
          if (Object.keys(deleteData).length > 0) {
            batch.update(docRef, deleteData);
          }
          
          // Add updated timestamp
          batch.update(docRef, {
            updated_at: new Date().toISOString()
          });
          
          await batch.commit();
          
          console.log(`Updated parcel ${parcel.id}: ${Object.keys(updateData).join(', ')}`);
          updated++;
        } else {
          console.log(`Skipped parcel ${parcel.id} - no changes needed`);
          skipped++;
        }
        
      } catch (error) {
        console.error(`Error updating parcel ${parcel.id}:`, error);
      }
    }
    
    console.log('=== Migration Complete ===');
    console.log(`Updated: ${updated} parcels`);
    console.log(`Skipped: ${skipped} parcels`);
    console.log(`Total: ${parcels.length} parcels`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateParcels();
