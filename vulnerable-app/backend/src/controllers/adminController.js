const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const db = require('../db/database');

function panel(req, res) {
  const result = {};
  db.all('SELECT * FROM users', (uErr, users) => {
    result.users = users || [];
    result.userError = uErr && uErr.message;
    db.all('SELECT * FROM clients', (cErr, clients) => {
      result.clients = clients || [];
      result.clientError = cErr && cErr.message;
      db.all('SELECT * FROM invoices', (iErr, invoices) => {
        result.invoices = invoices || [];
        result.invoiceError = iErr && iErr.message;
        result.requestUser = req.user;
        res.json(result);
      });
    });
  });
}

function debug(req, res) {
  res.json({
    env: process.env,
    memory: process.memoryUsage(),
    platform: os.platform(),
    cwd: process.cwd(),
    requestHeaders: req.headers
  });
}

function config(req, res) {
  res.json({
    db: process.env.DB_FILE,
    jwtSecret: process.env.JWT_SECRET || 'secret123',
    admin: {
      username: process.env.ADMIN_USER || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    },
    cors: '*',
    uploadDir: process.env.UPLOAD_DIR || 'src/uploads'
  });
}

function insecureCookie(req, res) {
  res.cookie('lab_session', 'admin:true:never-expire', {
    httpOnly: false,
    secure: false,
    sameSite: false
  });
  res.cookie('remember_user', req.query.user || 'admin', {
    httpOnly: false,
    secure: false
  });
  res.json({
    message: 'Cookies inseguras creadas sin HttpOnly, Secure ni SameSite estricto',
    cookies: req.headers.cookie || ''
  });
}

function openRedirect(req, res) {
  const next = req.query.next || 'http://example.com';
  res.redirect(next);
}

function reflectedXss(req, res) {
  const msg = req.query.msg || '<script>alert("xss-zap")</script>';
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head><title>Reflected XSS Lab</title></head>
      <body>
        <h1>Resultado de diagnostico</h1>
        <div id="message">${msg}</div>
        <form method="GET" action="/api/admin/lab/xss">
          <input name="msg" value="${msg}">
          <button>Probar</button>
        </form>
      </body>
    </html>
  `);
}

function readLocalFile(req, res) {
  const requested = req.query.path || 'package.json';
  const filePath = path.join(process.cwd(), requested);
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.status(500).json({ error: err.message, filePath });
    res.type('text/plain').send(content);
  });
}

function commandInjection(req, res) {
  const cmd = req.query.cmd || 'whoami';
  exec(cmd, { timeout: 7000 }, (err, stdout, stderr) => {
    res.json({
      command: cmd,
      error: err && err.message,
      stdout,
      stderr
    });
  });
}

function ssrfFetch(req, res) {
  const url = req.query.url || 'http://localhost:4000/api/admin/config';
  axios.get(url, { timeout: 5000 })
    .then((response) => {
      res.json({
        requestedUrl: url,
        status: response.status,
        headers: response.headers,
        body: response.data
      });
    })
    .catch((err) => {
      res.status(500).json({
        requestedUrl: url,
        error: err.message,
        stack: err.stack
      });
    });
}

function unsafeEval(req, res) {
  const code = req.query.code || 'process.version';
  try {
    const result = eval(code);
    res.json({ code, result: String(result) });
  } catch (err) {
    res.status(500).json({ code, error: err.message, stack: err.stack });
  }
}

function sqlDump(req, res) {
  const table = req.query.table || 'users';
  const limit = req.query.limit || '20';
  const sql = 'SELECT * FROM ' + table + ' LIMIT ' + limit;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message, sql });
    res.json({ sql, rows });
  });
}

function headerReflection(req, res) {
  res.set('X-Debug-User', req.query.user || 'admin');
  res.set('X-Original-URL', req.originalUrl);
  res.json({
    ip: req.ip,
    protocol: req.protocol,
    headers: req.headers,
    query: req.query
  });
}

module.exports = {
  panel,
  debug,
  config,
  insecureCookie,
  openRedirect,
  reflectedXss,
  readLocalFile,
  commandInjection,
  ssrfFetch,
  unsafeEval,
  sqlDump,
  headerReflection
};
