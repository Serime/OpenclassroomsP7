const multer = require('multer');
const bufferStorage = multer.memoryStorage();

module.exports = multer({ storage: bufferStorage }).single('image');