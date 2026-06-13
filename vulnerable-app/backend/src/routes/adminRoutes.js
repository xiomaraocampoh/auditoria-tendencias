const express = require('express');
const {
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
} = require('../controllers/adminController');
const { frontendOnlyAdminHint } = require('../middleware/auth');

const router = express.Router();
router.get('/panel', frontendOnlyAdminHint, panel);
router.get('/debug', debug);
router.get('/config', config);
router.get('/lab/cookie', insecureCookie);
router.get('/lab/redirect', openRedirect);
router.get('/lab/xss', reflectedXss);
router.get('/lab/file', readLocalFile);
router.get('/lab/cmd', commandInjection);
router.get('/lab/fetch', ssrfFetch);
router.get('/lab/eval', unsafeEval);
router.get('/lab/sql-dump', sqlDump);
router.get('/lab/headers', headerReflection);

module.exports = router;
