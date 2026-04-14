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
    res.json({ success: true, ...updateData });
  } catch (error) {
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
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        const trimmedRow = {};
        Object.keys(row).forEach(key => {
          trimmedRow[key.trim()] = row[key].trim();
        });

        const required = ['survey_no', 'sub_division', 'centroid_lat', 'centroid_lng', 'land_type'];
        const missing = required.filter(field => !trimmedRow[field]);
        
        if (missing.length > 0) {
          errors.push(`Row missing required fields: ${missing.join(', ')}`);
          skipped++;
          return;
        }

        const lat = parseFloat(trimmedRow.centroid_lat);
        const lng = parseFloat(trimmedRow.centroid_lng);

        if (isNaN(lat) || isNaN(lng)) {
          errors.push(`Invalid coordinates: ${trimmedRow.centroid_lat}, ${trimmedRow.centroid_lng}`);
          skipped++;
          return;
        }

        if (lat < 8.07 || lat > 13.57 || lng < 76.23 || lng > 80.33) {
          errors.push(`Coordinates outside Tamil Nadu bounds: ${lat}, ${lng}`);
          skipped++;
          return;
        }

        const validLandTypes = ['private', 'government', 'poramboke', 'forest'];
        const landType = validLandTypes.includes(trimmedRow.land_type.toLowerCase()) 
          ? trimmedRow.land_type.toLowerCase() 
          : 'private';

        let status = 'clear';
        if (landType === 'government' || landType === 'poramboke') {
          status = 'government';
        } else if (trimmedRow.status && ['clear', 'encroached', 'disputed'].includes(trimmedRow.status.toLowerCase())) {
          status = trimmedRow.status.toLowerCase();
        }

        const fullSurveyNo = trimmedRow.survey_no + "/" + (trimmedRow.sub_division || '');

        const parcel = {
          survey_no: trimmedRow.survey_no,
          sub_division: trimmedRow.sub_division,
          ulpin: '',
          village_lgd_code: '',
          patta_no: '',
          owner_name: 'Unknown',
          area_acres: parseFloat(trimmedRow.area_acres) || 1,
          district: 'Chengalpattu',
          taluk: 'Pallavaram',
          village: 'Zamin Pallavaram',
          land_type: landType,
          status: status,
          centroid_lat: lat,
          centroid_lng: lng,
          geojson_coordinates: JSON.stringify(generatePolygonFromCentroid(lat, lng, parseFloat(trimmedRow.area_acres) || 1)),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        results.push(parcel);
      })
      .on('end', async () => {
        try {
          console.log('Processing', results.length, 'parcels from CSV...');
          
          for (const parcel of results) {
            console.log('Saving parcel:', parcel.survey_no, parcel.sub_division);
            await db.collection(COLLECTION).add(parcel);
            imported++;
          }

          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            message: 'CSV processed successfully',
            total: results.length + skipped,
            imported,
            updated,
            skipped,
            errors
          });
        } catch (error) {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ message: error.message });
        }
      });
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
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
  uploadCSV
};
