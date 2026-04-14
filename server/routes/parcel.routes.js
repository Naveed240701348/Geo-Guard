const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/parcel.controller');
const auth       = require('../middleware/authMiddleware');
const upload     = require('../middleware/uploadMiddleware');

router.post('/upload-csv', auth, upload.single('csvFile'), controller.uploadCSV);
router.get('/',            controller.getAllParcels);
router.get('/:surveyNo',   controller.getParcelBySurveyNo);
router.post('/',      auth, controller.addParcel);
router.put('/:id',    auth, controller.updateParcel);
router.delete('/:id', auth, controller.deleteParcel);

module.exports = router;
