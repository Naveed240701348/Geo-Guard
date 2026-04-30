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
      .get();
    
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by created_at in JavaScript instead of Firestore
    complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log('Returning complaints:', complaints.length);
    res.json(complaints);
  } catch (error) {
    console.error('Error in getMyComplaints:', error);
    res.status(500).json({ message: error.message });
  }
};

const fileComplaint = async (req, res) => {
  try {
    console.log('=== Complaint Submission Debug ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.file);
    console.log('User info:', req.user);
    
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const complaintData = {
      user_id: req.user.uid,
      user_name: req.user.displayName || req.user.email || 'User',
      survey_no: req.body.survey_no || '',
      description: req.body.description || '',
      photo_url: req.file ? req.file.filename : '',
      lat: parseFloat(req.body.lat) || 12.9675,
      lng: parseFloat(req.body.lng) || 80.1491,
      status: 'open',
      admin_remarks: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Complaint data:', complaintData);
    console.log('Saving to Firestore collection:', COLLECTION);
    
    const docRef = await db.collection(COLLECTION).add(complaintData);
    console.log('Complaint saved successfully with ID:', docRef.id);
    
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('=== Complaint Submission Error ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

const debugComplaints = async (req, res) => {
  try {
    console.log('=== Debug Complaints ===');
    console.log('Current user:', req.user);
    
    // Get all complaints
    const allSnapshot = await db.collection(COLLECTION).get();
    const allComplaints = allSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Total complaints in database:', allComplaints.length);
    
    // Get user's complaints
    const userSnapshot = await db.collection(COLLECTION)
      .where('user_id', '==', req.user.uid)
      .get();
    const userComplaints = userSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Complaints for current user:', userComplaints.length);
    
    // Show details
    console.log('All complaints:');
    allComplaints.forEach(c => {
      console.log(`- ID: ${c.id}, User: ${c.user_id}, Description: ${c.description.substring(0, 50)}...`);
    });
    
    console.log('User complaints:');
    userComplaints.forEach(c => {
      console.log(`- ID: ${c.id}, User: ${c.user_id}, Description: ${c.description.substring(0, 50)}...`);
    });
    
    res.json({
      totalComplaints: allComplaints.length,
      userComplaints: userComplaints.length,
      currentUserId: req.user.uid,
      allComplaints: allComplaints,
      userComplaints: userComplaints
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: error.message });
  }
};

const fixComplaintUserIds = async (req, res) => {
  try {
    console.log('=== Fix Complaint User IDs ===');
    
    // Get all complaints
    const snapshot = await db.collection(COLLECTION).get();
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Found', complaints.length, 'complaints');
    
    let updated = 0;
    for (const complaint of complaints) {
      // If complaint doesn't belong to current user, update it
      if (complaint.user_id !== req.user.uid) {
        console.log(`Updating complaint ${complaint.id} from user_id ${complaint.user_id} to ${req.user.uid}`);
        await db.collection(COLLECTION).doc(complaint.id).update({
          user_id: req.user.uid,
          updated_at: new Date().toISOString()
        });
        updated++;
      }
    }
    
    console.log(`Updated ${updated} complaints to user_id: ${req.user.uid}`);
    
    res.json({
      success: true,
      totalComplaints: complaints.length,
      updated,
      currentUserId: req.user.uid
    });
  } catch (error) {
    console.error('Fix error:', error);
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
  debugComplaints,
  fixComplaintUserIds,
  updateComplaint
};
