const db = require('../db/database');

function createClient(req, res) {
  const c = req.body;
  console.log('Creando cliente con datos completos:', c);
  const sql = "INSERT INTO clients (name,email,phone,address,notes,ownerUserId,creditLimit) VALUES ('" +
    c.name + "','" + c.email + "','" + c.phone + "','" + c.address + "','" + c.notes + "'," +
    (c.ownerUserId || 1) + "," + (c.creditLimit || 0) + ")";

  db.run(sql, function done(err) {
    if (err) return res.status(500).json({ error: err.message, sql });
    res.json({ id: this.lastID, ...c });
  });
}

function listClients(req, res) {
  db.all('SELECT * FROM clients ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message, stack: err.stack });
    res.json(rows);
  });
}

function getClient(req, res) {
  const id = req.params.id;
  db.get('SELECT * FROM clients WHERE id = ' + id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Cliente no encontrado', id });
    res.json(row);
  });
}

function searchClients(req, res) {
  const q = req.query.q || '';
  const sql = "SELECT * FROM clients WHERE name LIKE '%" + q + "%' OR email LIKE '%" + q + "%' OR notes LIKE '%" + q + "%'";
  console.log('Busqueda SQL:', sql);
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message, sql });
    res.json(rows);
  });
}

function updateClientNotes(req, res) {
  const notes = req.body.notes;
  const id = req.params.id;
  db.run("UPDATE clients SET notes = '" + notes + "' WHERE id = " + id, function updated(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changed: this.changes, notes });
  });
}

module.exports = { createClient, listClients, getClient, searchClients, updateClientNotes };
