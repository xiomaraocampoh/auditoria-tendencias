const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFile = process.env.DB_FILE || path.join(__dirname, 'cartera.sqlite');
const db = new sqlite3.Database(dbFile);

module.exports = db;
