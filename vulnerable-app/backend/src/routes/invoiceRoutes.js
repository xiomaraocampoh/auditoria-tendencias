const express = require('express');
const controller = require('../controllers/invoiceController');

const router = express.Router();
router.get('/', controller.listInvoices);
router.get('/overdue', controller.overdueInvoices);
router.get('/search', controller.searchInvoices);
router.post('/', controller.createInvoice);

module.exports = router;
