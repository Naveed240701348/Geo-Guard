const { db } = require('../config/firebase');
const COLLECTION = 'complaints';

const getAllComplaints = async (req, res) => {
  try {
    let query = db.collection(COLLECTION).orderBy('created_at', 'desc');
    
    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }
    
    const snapshot = await query.get();
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    console.log('getMyComplaints called, req.user:', req.user);
    const snapshot = await db.collection(COLLECTION)
      .where('user_id', '==', req.user.uid)
      .orderBy('created_at', 'desc')
      .get();
    
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Returning complaints:', complaints.length);
    res.json(complaints);
  } catch (error) {
    console.error('Error in getMyComplaints:', error);
    res.status(500).json({ message: error.message });
  }
};

const fileComplaint = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.file);
    
    const complaintData = {
      user_id: req.user.uid,
      user_name: req.user.displayName || req.user.email || 'User',
      survey_no: req.body.survey_no || '',
      description: req.body.description || '',
      photo_url: req.file ? `complaints/${req.file.filename}` : '',
      lat: parseFloat(req.body.lat) || 12.9675,
      lng: parseFloat(req.body.lng) || 80.1491,
      status: 'open',
      admin_remarks: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Complaint data:', complaintData);
    
    const docRef = await db.collection(COLLECTION).add(complaintData);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const updateData = {
      status: req.body.status,
      admin_remarks: req.body.admin_remarks || '',
      updated_at: new Date().toISOString()
    };
    
    await db.collection(COLLECTION).doc(req.params.id).update(updateData);
    res.json({ success: true, ...updateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllComplaints,
  getMyComplaints,
  fileComplaint,
  updateComplaint
};
