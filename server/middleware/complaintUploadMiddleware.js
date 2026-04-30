const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  console.log('Complaint photo filter checking:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname
  });
  
  const ext = path.extname(file.originalname).toLowerCase();
  console.log('File extension:', ext);
  
  // Allow common image formats for complaint photos
  if (['.jpg','.jpeg','.png','.gif','.webp'].includes(ext)) {
    console.log('Photo file accepted');
    cb(null, true);
  } else {
    console.log('Photo file rejected - only image files allowed');
    cb(new Error('Only image files allowed for complaint photos'));
  }
};

module.exports = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for photos
});
