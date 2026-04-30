const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/complaint.controller');
const auth       = require('../middleware/authMiddleware');
const upload     = require('../middleware/complaintUploadMiddleware');

router.get('/',       auth, controller.getAllComplaints);
router.get('/mine',   auth, controller.getMyComplaints);
router.get('/debug',  auth, controller.debugComplaints);
router.post('/fix',   auth, controller.fixComplaintUserIds);
router.post('/',      auth, upload.single('photo'), controller.fileComplaint);
router.put('/:id',    auth, controller.updateComplaint);

module.exports = router;
