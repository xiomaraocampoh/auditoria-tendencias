require('dotenv').config();
const db = require('./database');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS users');
  db.run('DROP TABLE IF EXISTS clients');
  db.run('DROP TABLE IF EXISTS invoices');
  db.run('DROP TABLE IF EXISTS uploads');

  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    role TEXT,
    email TEXT,
    fullName TEXT
  )`);

  db.run(`CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    ownerUserId INTEGER,
    creditLimit REAL
  )`);

  db.run(`CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER,
    invoiceNumber TEXT,
    amount REAL,
    dueDate TEXT,
    status TEXT,
    comments TEXT
  )`);

  db.run(`CREATE TABLE uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceId INTEGER,
    fileName TEXT,
    originalName TEXT,
    path TEXT,
    uploadedBy TEXT
  )`);

  db.run("INSERT INTO users (username,password,role,email,fullName) VALUES ('admin','admin123','admin','admin@local.test','Administrador General')");
  db.run("INSERT INTO users (username,password,role,email,fullName) VALUES ('analista','password','user','analista@local.test','Analista de Cartera')");
  db.run("INSERT INTO users (username,password,role,email,fullName) VALUES ('cliente1','cliente123','client','cliente1@local.test','Cliente Uno')");

  db.run("INSERT INTO clients (name,email,phone,address,notes,ownerUserId,creditLimit) VALUES ('Comercial Demo SAS','contacto@demo.test','555-1000','Calle 1 # 2-3','Cliente con <b>observaciones HTML</b> y saldo alto',2,5000000)");
  db.run("INSERT INTO clients (name,email,phone,address,notes,ownerUserId,creditLimit) VALUES ('Riesgo Visible Ltda','riesgo@local.test','555-9999','Avenida Central','<span style=\"color:#dc2626;font-weight:700\">HTML no sanitizado desde CRM anterior</span>',3,1200000)");

  db.run("INSERT INTO invoices (clientId,invoiceNumber,amount,dueDate,status,comments) VALUES (1,'FAC-001',1300000,'2025-11-15','overdue','Pago prometido para la proxima semana')");
  db.run("INSERT INTO invoices (clientId,invoiceNumber,amount,dueDate,status,comments) VALUES (1,'FAC-002',700000,'2026-06-01','open','Factura reciente')");
  db.run("INSERT INTO invoices (clientId,invoiceNumber,amount,dueDate,status,comments) VALUES (2,'FAC-003',450000,'2025-10-10','overdue','Cliente solicita prorroga')");

  console.log('Base de datos recreada con datos inseguros de laboratorio.');
});

db.close();
