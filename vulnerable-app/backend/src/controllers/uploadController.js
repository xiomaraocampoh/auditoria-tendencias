const path = require('path');
const multer = require('multer');
const db = require('../db/database');

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function filename(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

function saveUpload(req, res) {
  const invoiceId = req.body.invoiceId || 0;
  const uploadedBy = (req.user && req.user.username) || req.body.uploadedBy || 'anonymous';
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No se recibio archivo' });

  const sql = "INSERT INTO uploads (invoiceId,fileName,originalName,path,uploadedBy) VALUES (" +
    invoiceId + ",'" + file.filename + "','" + file.originalname + "','" + file.path + "','" + uploadedBy + "')";

  db.run(sql, function inserted(err) {
    if (err) return res.status(500).json({ error: err.message, sql });
    res.json({
      id: this.lastID,
      fileName: file.filename,
      publicUrl: '/uploads/' + file.filename,
      fullPath: file.path
    });
  });
}

function listUploads(req, res) {
  db.all('SELECT * FROM uploads ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}

module.exports = { upload, saveUpload, listUploads };
