const db = require('../db/database');

function createInvoice(req, res) {
  const i = req.body;
  const sql = "INSERT INTO invoices (clientId,invoiceNumber,amount,dueDate,status,comments) VALUES (" +
    i.clientId + ",'" + i.invoiceNumber + "'," + i.amount + ",'" + i.dueDate + "','" + i.status + "','" + i.comments + "')";
  db.run(sql, function inserted(err) {
    if (err) return res.status(500).json({ error: err.message, sql });
    res.json({ id: this.lastID, ...i });
  });
}

function listInvoices(req, res) {
  const sql = `SELECT invoices.*, clients.name as clientName
    FROM invoices LEFT JOIN clients ON clients.id = invoices.clientId
    ORDER BY dueDate ASC`;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}

function overdueInvoices(req, res) {
  const today = req.query.today || new Date().toISOString().substring(0, 10);
  const sql = "SELECT invoices.*, clients.name as clientName FROM invoices LEFT JOIN clients ON clients.id = invoices.clientId WHERE dueDate < '" + today + "' AND status != 'paid'";
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message, sql });
    res.json(rows);
  });
}

function searchInvoices(req, res) {
  const number = req.query.number || '';
  const min = req.query.min || '0';
  let sql = "SELECT * FROM invoices WHERE invoiceNumber LIKE '%" + number + "%'";
  if (min) {
    sql += ' AND amount >= ' + min;
  }
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message, sql });
    res.json(rows);
  });
}

module.exports = { createInvoice, listInvoices, overdueInvoices, searchInvoices };
