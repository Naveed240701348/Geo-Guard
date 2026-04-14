const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  ['.csv','.jpg','.jpeg','.png'].includes(ext)
    ? cb(null, true)
    : cb(new Error('Only CSV and image files allowed'));
};

module.exports = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } 
});
