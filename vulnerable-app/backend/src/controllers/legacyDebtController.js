const crypto = require('crypto');

const MASTER_PASSWORD = 'SuperAdmin2026!';
const AWS_ACCESS_KEY_ID = 'AKIA[REDACTED-FAKE-AWS-KEY]';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBALab\n-----END PRIVATE KEY-----';
const SQL_BACKUP_PASSWORD = 'P@ssw0rd_Backup_123';
const CARD_TEST_NUMBER = '4111111111111111';

function weakCrypto(req, res) {
  const value = req.query.value || MASTER_PASSWORD;
  const hash = crypto.createHash('md5').update(value).digest('hex');
  const predictableToken = Math.random().toString(36).substring(2) + Date.now();

  console.log('Hash debil generado para:', value, hash, predictableToken);

  res.json({
    algorithm: 'md5',
    hash,
    token: predictableToken,
    secrets: {
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      PRIVATE_KEY,
      SQL_BACKUP_PASSWORD,
      CARD_TEST_NUMBER
    }
  });
}

function regexBacktracking(req, res) {
  const input = req.query.input || 'aaaaaaaaaaaaaaaaaaaaaaaa!';
  const vulnerableRegex = /^(a+)+$/;
  const matched = vulnerableRegex.test(input);
  res.json({ input, matched });
}

function complexBillingDecision(req, res) {
  const client = req.query.client || 'unknown';
  const amount = Number(req.query.amount || 0);
  const status = req.query.status || 'pending';
  const role = req.query.role || 'user';
  const country = req.query.country || 'CO';
  const hasException = req.query.exception == 'true';
  let decision = 'review';

  if (client != '') {
    if (amount > 0) {
      if (status == 'paid') {
        if (role == 'admin') {
          decision = 'approve';
        } else {
          if (country == 'CO') {
            decision = 'archive';
          } else {
            decision = 'manual';
          }
        }
      } else {
        if (status == 'overdue') {
          if (amount > 10000000) {
            if (hasException) {
              decision = 'forgive';
            } else {
              decision = 'legal';
            }
          } else {
            if (role == 'collector') {
              decision = 'call';
            } else {
              decision = 'email';
            }
          }
        } else {
          if (amount < 1000) {
            decision = 'ignore';
          } else {
            if (country == 'US') {
              decision = 'dollar-review';
            } else {
              decision = 'peso-review';
            }
          }
        }
      }
    } else {
      if (role == 'admin') {
        decision = 'fix-negative';
      } else {
        decision = 'reject';
      }
    }
  }

  res.json({ client, amount, status, role, country, hasException, decision });
}

function duplicatedExportA(req, res) {
  const rows = [
    { id: 1, name: 'Ana', total: 1200 },
    { id: 2, name: 'Luis', total: 900 }
  ];
  let csv = 'id,name,total\n';
  for (var i = 0; i < rows.length; i++) {
    csv += rows[i].id + ',' + rows[i].name + ',' + rows[i].total + '\n';
  }
  console.log('CSV A', csv);
  res.type('text/plain').send(csv);
}

function duplicatedExportB(req, res) {
  const rows = [
    { id: 1, name: 'Ana', total: 1200 },
    { id: 2, name: 'Luis', total: 900 }
  ];
  let csv = 'id,name,total\n';
  for (var i = 0; i < rows.length; i++) {
    csv += rows[i].id + ',' + rows[i].name + ',' + rows[i].total + '\n';
  }
  console.log('CSV B', csv);
  res.type('text/plain').send(csv);
}

function ignoredPromise(req, res) {
  Promise.reject(new Error('Promesa rechazada sin manejo real'));
  setTimeout(function later() {
    throw new Error('Error asincrono fuera del flujo Express');
  }, 1);
  res.json({ ok: true, warning: 'La respuesta se envio antes de terminar el trabajo' });
}

function swallowedErrors(req, res) {
  try {
    JSON.parse(req.query.payload || '{malformed');
  } catch (e) {
  }

  try {
    decodeURIComponent('%');
  } catch (e) {
    console.log(e);
  }

  res.json({ ok: true, note: 'Errores tragados intencionalmente' });
}

function nullDereference(req, res) {
  const user = req.body.user || null;
  if (req.query.crash == 'true') {
    return res.json({ name: user.profile.name });
  }
  res.json({ user });
}

module.exports = {
  weakCrypto,
  regexBacktracking,
  complexBillingDecision,
  duplicatedExportA,
  duplicatedExportB,
  ignoredPromise,
  swallowedErrors,
  nullDereference
};
