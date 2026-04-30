const csv  = require('csv-parser');
const fs   = require('fs');
const { db } = require('../config/firebase');
const { generatePolygonFromCentroid } = require('../utils/generatePolygon');
const COLLECTION = 'land_parcels';

const getAllParcels = async (req, res) => {
  try {
    console.log('Fetching all parcels from Firestore...');
    const snapshot = await db.collection(COLLECTION).get();
    console.log('Retrieved', snapshot.docs.length, 'parcels');
    const parcels = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(parcels);
  } catch (error) {
    console.error('Error in getAllParcels:', error);
    res.status(500).json({ message: error.message });
  }
};

const getParcelBySurveyNo = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION)
      .where('survey_no', '==', req.params.surveyNo)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    const parcel = snapshot.docs[0];
    res.json({ id: parcel.id, ...parcel.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addParcel = async (req, res) => {
  try {
    const parcelData = {
      ...req.body,
      geojson_coordinates: JSON.stringify(generatePolygonFromCentroid(
        req.body.centroid_lat,
        req.body.centroid_lng,
        req.body.area_acres || 1
      )),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const docRef = await db.collection(COLLECTION).add(parcelData);
    res.json({ id: docRef.id, ...parcelData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateParcel = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    await db.collection(COLLECTION).doc(req.params.id).update(updateData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const migrateParcels = async (req, res) => {
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
            deleteData[field] = require('firebase-admin').firestore.FieldValue.delete();
          }
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length > 0 || Object.keys(deleteData).length > 0) {
          const docRef = db.collection(COLLECTION).doc(parcel.id);
          
          // Add updates
          if (Object.keys(updateData).length > 0) {
            await docRef.update(updateData);
          }
          
          // Add deletions
          if (Object.keys(deleteData).length > 0) {
            await docRef.update(deleteData);
          }
          
          // Add updated timestamp
          await docRef.update({
            updated_at: new Date().toISOString()
          });
          
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
    
    res.json({
      success: true,
      message: 'Migration completed successfully',
      updated,
      skipped,
      total: parcels.length
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteParcel = async (req, res) => {
  try {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadCSV = async (req, res) => {
  try {
    console.log('CSV upload request received:', {
      file: req.file ? req.file.originalname : 'No file',
      size: req.file ? req.file.size : 0,
      mimetype: req.file ? req.file.mimetype : 'No mimetype'
    });
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let imported = 0;
    let skipped = 0;
    let processedRows = 0;

    // Parse CSV first
    const parseCSV = () => {
      return new Promise((resolve, reject) => {
        const parcels = [];
        
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('error', (error) => {
            console.error('CSV parsing error:', error);
            reject(error);
          })
          .on('data', (data) => {
            try {
              processedRows++;
              
              // Trim whitespace from all fields
              const trimmedRow = {};
              Object.keys(data).forEach(key => {
                trimmedRow[key.trim()] = data[key] ? data[key].trim() : '';
              });

              // Debug: Log all available fields
              console.log(`Row ${processedRows} fields:`, Object.keys(trimmedRow));
              console.log(`Row ${processedRows} data:`, trimmedRow);

              // Flexible field name matching
              const fieldMapping = {
                // Survey number variations
                'survey_number': 'survey_number',
                'survey_no': 'survey_number', 
                'survey no': 'survey_number',
                
                // Sub division variations
                'sub_division': 'sub_division',
                'subdivision': 'sub_division',
                'sub division': 'sub_division',
                'sub_division number': 'sub_division',
                'subdivision number': 'sub_division',
                'sub division number': 'sub_division',
                
                // Area variations
                'area_acres': 'area_acres',
                'area': 'area_acres',
                'acres': 'area_acres',
                
                // Status variations (case insensitive)
                'status': 'status',
                'Status': 'status',
                
                // Land type variations
                'land_type': 'land_type',
                'landtype': 'land_type',
                'land type': 'land_type',
                
                // Coordinates variations
                'latitude': 'latitude',
                'lat': 'latitude',
                'longitude': 'longitude', 
                'lng': 'longitude',
                'long': 'longitude'
              };

              // Create normalized row with mapped field names
              const normalizedRow = {};
              Object.keys(trimmedRow).forEach(originalKey => {
                const normalizedKey = fieldMapping[originalKey.toLowerCase()] || originalKey;
                normalizedRow[normalizedKey] = trimmedRow[originalKey];
              });

              // Validate required fields on normalized data
              const required = ['survey_number', 'sub_division', 'area_acres', 'district', 'taluk', 'village', 'land_type', 'status', 'latitude', 'longitude'];
              const missing = required.filter(field => !normalizedRow[field]);
              
              if (missing.length > 0) {
                console.log(`Missing fields in row ${processedRows}:`, missing);
                console.log(`Available fields:`, Object.keys(normalizedRow));
                errors.push({ 
                  row: processedRows, 
                  error: `Missing required fields: ${missing.join(', ')}. Available fields: ${Object.keys(normalizedRow).join(', ')}`,
                  data: normalizedRow
                });
                return;
              }

              // Validate coordinates
              const lat = parseFloat(normalizedRow.latitude);
              const lng = parseFloat(normalizedRow.longitude);
              
              if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                errors.push({ 
                  row: processedRows, 
                  error: `Invalid coordinates: lat=${trimmedRow.latitude}, lng=${trimmedRow.longitude}`,
                  data: trimmedRow
                });
                return;
              }

              // Validate land type
              const landType = normalizedRow.land_type.toLowerCase();
              const validLandTypes = ['private', 'government', 'poramboke', 'forest'];
              
              if (!validLandTypes.includes(landType)) {
                errors.push({ 
                  row: processedRows, 
                  error: `Invalid land type: ${normalizedRow.land_type}. Must be one of: ${validLandTypes.join(', ')}`,
                  data: normalizedRow
                });
                return;
              }

              // Validate status with flexible mapping
              const originalStatus = normalizedRow.status ? normalizedRow.status.toLowerCase().trim() : 'active';
              
              // Map common variations to valid statuses
              const statusMapping = {
                'clear': 'active',
                'government': 'active', 
                'private': 'active',
                'active': 'active',
                'encroached': 'encroached',
                'encroachment': 'encroached',
                'disputed': 'disputed',
                'dispute': 'disputed',
                'under_litigation': 'under_litigation',
                'litigation': 'under_litigation',
                'under litigation': 'under_litigation',
                'in litigation': 'under_litigation'
              };
              
              const status = statusMapping[originalStatus] || 'active';
              const validStatuses = ['active', 'encroached', 'disputed', 'under_litigation'];
              
              // Log mapping for debugging
              if (originalStatus !== status) {
                console.log(`Status mapping: "${normalizedRow.status}" -> "${status}" (row ${processedRows})`);
              }

              const parcel = {
                survey_no: normalizedRow.survey_number,
                sub_division: normalizedRow.sub_division,
                area_acres: parseFloat(normalizedRow.area_acres) || 1,
                district: normalizedRow.district || 'Chengalpattu',
                taluk: normalizedRow.taluk || 'Pallavaram',
                village: normalizedRow.village || 'Zamin Pallavaram',
                land_type: landType,
                status: status,
                centroid_lat: lat,
                centroid_lng: lng,
                geojson_coordinates: JSON.stringify(generatePolygonFromCentroid(lat, lng, parseFloat(normalizedRow.area_acres) || 1)),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              parcels.push(parcel);
            } catch (error) {
              console.error('Error processing row:', error);
              errors.push({ 
                row: processedRows, 
                error: error.message,
                data: data
              });
            }
          })
          .on('end', () => {
            resolve(parcels);
          });
      });
    };

    // Parse CSV
    const parsedParcels = await parseCSV();
    console.log(`Parsed ${parsedParcels.length} valid parcels from ${processedRows} rows`);

    // Process in batches to avoid memory issues and timeouts
    const batchSize = 50; // Process 50 parcels at a time
    const totalBatches = Math.ceil(parsedParcels.length / batchSize);
    
    console.log(`Processing ${parsedParcels.length} parcels in ${totalBatches} batches...`);

    for (let i = 0; i < parsedParcels.length; i += batchSize) {
      const batch = parsedParcels.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} parcels)`);
      
      // Get existing parcels only for this batch's geographic area to reduce memory usage
      const batchLatitudes = batch.map(p => p.centroid_lat);
      const batchLongitudes = batch.map(p => p.centroid_lng);
      
      const minLat = Math.min(...batchLatitudes) - 0.01;
      const maxLat = Math.max(...batchLatitudes) + 0.01;
      const minLng = Math.min(...batchLongitudes) - 0.01;
      const maxLng = Math.max(...batchLongitudes) + 0.01;
      
      // Query only parcels in this geographic area using a simpler approach
      // First query by latitude range
      const latSnapshot = await db.collection(COLLECTION)
        .where('centroid_lat', '>=', minLat)
        .where('centroid_lat', '<=', maxLat)
        .get();
      
      // Then filter by longitude in memory (avoids composite index requirement)
      const existingParcels = latSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(parcel => parcel.centroid_lng >= minLng && parcel.centroid_lng <= maxLng);
      
      console.log(`Found ${existingParcels.length} existing parcels in this area`);
      
      // Process each parcel in the batch
      for (const parcel of batch) {
        // Check for overlaps with existing parcels
        let hasOverlap = false;
        
        for (const existing of existingParcels) {
          // Simple distance check between centroids
          const distance = Math.sqrt(
            Math.pow(parcel.centroid_lat - existing.centroid_lat, 2) + 
            Math.pow(parcel.centroid_lng - existing.centroid_lng, 2)
          );
          
          if (distance < 0.0005) { // ~55m threshold
            console.warn(`Parcel ${parcel.survey_no} overlaps with existing parcel ${existing.survey_no}`);
            hasOverlap = true;
            skipped++;
            break;
          }
        }
        
        if (!hasOverlap) {
          try {
            console.log(`Saving parcel: ${parcel.survey_no} (${parcel.sub_division})`);
            await db.collection(COLLECTION).add(parcel);
            imported++;
          } catch (error) {
            console.error(`Error saving parcel ${parcel.survey_no}:`, error);
            errors.push({ 
              row: 0, 
              error: `Failed to save parcel ${parcel.survey_no}: ${error.message}`,
              data: parcel
            });
            skipped++;
          }
        }
      }
      
      // Add a small delay between batches to prevent overwhelming the database
      if (batchNumber < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.log(`CSV processing complete: ${imported} imported, ${skipped} skipped, ${errors.length} errors`);

    res.json({
      success: true,
      message: 'CSV processed successfully',
      total: parsedParcels.length,
      imported,
      skipped,
      errors: errors.map(e => e.error || e) // Simplify error format
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllParcels,
  getParcelBySurveyNo,
  addParcel,
  updateParcel,
  deleteParcel,
  uploadCSV,
  migrateParcels
};
