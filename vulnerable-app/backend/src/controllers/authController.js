const db = require('../db/database');

function login(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  console.log('Intento de login:', username, password);

  const sql = "SELECT * FROM users WHERE username = '" + username + "'";
  db.get(sql, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message, sql });
    }
    if (!user) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Password incorrecto para usuario existente' });
    }

    const token = 'token-' + user.id + '-' + user.username + '-' + user.role;
    res.json({
      token,
      user,
      message: 'Login correcto sin expiracion configurada'
    });
  });
}

function listUsers(req, res) {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
    res.json(rows);
  });
}

function createUser(req, res) {
  const b = req.body;
  const sql = "INSERT INTO users (username,password,role,email,fullName) VALUES ('" +
    b.username + "','" + b.password + "','" + b.role + "','" + b.email + "','" + b.fullName + "')";
  db.run(sql, function onInsert(err) {
    if (err) return res.status(500).json({ error: err.message, sql });
    res.json({ id: this.lastID, ...b });
  });
}

module.exports = { login, listUsers, createUser };
