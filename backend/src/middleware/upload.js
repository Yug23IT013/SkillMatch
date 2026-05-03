const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/resumes/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Allowed MIME types and their corresponding extensions
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx)$/i;

const fileFilter = (req, file, cb) => {
  const extOk  = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
  const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);

  if (extOk && mimeOk) return cb(null, true);
  cb(Object.assign(
    new Error('Only PDF and Word documents (.pdf, .doc, .docx) are allowed'),
    { status: 415 }
  ));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1,                  // only one file per request
  },
  fileFilter
});

module.exports = upload;
