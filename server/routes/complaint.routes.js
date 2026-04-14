const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/complaint.controller');
const auth       = require('../middleware/authMiddleware');
const upload     = require('../middleware/uploadMiddleware');

router.get('/',       auth, controller.getAllComplaints);
router.get('/mine',   auth, controller.getMyComplaints);
router.post('/',      auth, upload.single('photo'), controller.fileComplaint);
router.put('/:id',    auth, controller.updateComplaint);

module.exports = router;
