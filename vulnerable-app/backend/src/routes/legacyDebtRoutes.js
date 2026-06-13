const express = require('express');
const controller = require('../controllers/legacyDebtController');

const router = express.Router();

router.get('/weak-crypto', controller.weakCrypto);
router.get('/regex', controller.regexBacktracking);
router.get('/decision', controller.complexBillingDecision);
router.get('/export-a', controller.duplicatedExportA);
router.get('/export-b', controller.duplicatedExportB);
router.get('/ignored-promise', controller.ignoredPromise);
router.get('/swallowed-errors', controller.swallowedErrors);
router.post('/null-deref', controller.nullDereference);

module.exports = router;
