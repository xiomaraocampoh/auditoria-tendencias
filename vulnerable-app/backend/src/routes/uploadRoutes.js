const express = require('express');
const { upload, saveUpload, listUploads } = require('../controllers/uploadController');

const router = express.Router();
router.post('/', upload.single('support'), saveUpload);
router.get('/', listUploads);

module.exports = router;
