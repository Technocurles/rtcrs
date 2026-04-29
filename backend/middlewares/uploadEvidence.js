const multer = require("multer");

console.log(">>> uploadEvidence middleware loaded <<<");

const storage = multer.memoryStorage();

// Allowed image formats (JPG, JPEG, PNG)
const allowedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png'
];

// Allowed video formats (MP4, WebM, OGG, MOV, AVI)
const allowedVideoTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo'
];

// Allowed audio formats (MP3, WAV, OGG, M4A)
const allowedAudioTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a'
];

// Combined allowed types
const allowedMimeTypes = [
  ...allowedImageTypes,
  ...allowedVideoTypes,
  ...allowedAudioTypes
];

const fileFilter = (req, file, cb) => {
  console.log(">>> Multer fileFilter called <<<");
  console.log("File:", file.originalname, "Type:", file.mimetype || "NO MIME TYPE");
  
  // Check if file has a valid mime type
  if (!file.mimetype || !allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    const error = new Error('Unsupported file format. Only JPG, JPEG, PNG images, MP4, WebM, OGG videos, and MP3, WAV, OGG, M4A audio are allowed.');
    error.code = 'LIMIT_FILE_TYPES';
    console.log("File rejected - unsupported format:", file.originalname);
    return cb(error, false);
  }
  
  cb(null, true);
};

const uploadEvidence = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max (for video)
    files: 5,
  },
  fileFilter,
});

// Custom error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_TYPES') {
    return res.status(400).json({
      message: err.message
    });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File size exceeds 25MB limit'
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      message: 'Maximum 5 evidence files allowed'
    });
  }
  next(err);
};

module.exports = { uploadEvidence, handleMulterError };

