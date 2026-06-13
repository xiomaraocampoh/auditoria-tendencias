const express = require('express');
const { login, listUsers, createUser } = require('../controllers/authController');

const router = express.Router();
router.post('/login', login);
router.get('/users', listUsers);
router.post('/users', createUser);

module.exports = router;
