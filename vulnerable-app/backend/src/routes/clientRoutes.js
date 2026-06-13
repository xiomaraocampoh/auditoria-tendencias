const express = require('express');
const controller = require('../controllers/clientController');

const router = express.Router();
router.get('/', controller.listClients);
router.get('/search', controller.searchClients);
router.get('/:id', controller.getClient);
router.post('/', controller.createClient);
router.put('/:id/notes', controller.updateClientNotes);

module.exports = router;
