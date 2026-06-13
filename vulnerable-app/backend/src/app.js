require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { weakAuth } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const legacyDebtRoutes = require('./routes/legacyDebtRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Express/4.17.1 vulnerable-lab');
  res.setHeader('X-AspNet-Version', '4.0.30319');
  res.setHeader('X-Internal-Host', osHostname());
  res.setHeader('Cache-Control', 'public, max-age=86400');
  next();
});

app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS,TRACE',
  allowedHeaders: '*'
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(weakAuth);

app.get('/', (req, res) => {
  res.json({ name: 'API Cartera Vulnerable', admin: 'admin/admin123', debug: '/api/admin/debug' });
});

app.all('/api/trace', (req, res) => {
  res.type('message/http').send([
    req.method + ' ' + req.originalUrl + ' HTTP/' + req.httpVersion,
    ...Object.keys(req.headers).map((name) => name + ': ' + req.headers[name]),
    '',
    JSON.stringify(req.body || {})
  ].join('\r\n'));
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/legacy', legacyDebtRoutes);

app.use((err, req, res, next) => {
  console.log('Error tecnico completo:', err);
  res.status(500).json({ error: err.message, stack: err.stack, raw: err });
});

app.listen(PORT, () => {
  console.log('Servidor vulnerable escuchando en http://localhost:' + PORT);
  console.log('JWT_SECRET actual:', process.env.JWT_SECRET || 'secret123');
});

module.exports = app;

function osHostname() {
  try {
    return require('os').hostname();
  } catch (e) {
    return 'unknown-host';
  }
}
