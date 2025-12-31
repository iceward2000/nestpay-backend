import express from 'express';
import crypto from 'crypto';
import { nestpayConfig } from '../config/nestpay.js';

const router = express.Router();

/**
 * Hash v3 generator (Payten compliant)
 */
function generateHashV3(params, storeKey) {
  const sortedKeys = Object.keys(params).sort();
  let hashStr = '';

  for (const key of sortedKeys) {
    if (params[key]) {
      hashStr += params[key];
    }
  }

  hashStr += storeKey;

  return crypto
    .createHash('sha512')
    .update(hashStr, 'utf-8')
    .digest('base64');
}

/**
 * START PAYMENT
 * GET /api/payment/initiate
 */
router.get('/initiate', (req, res) => {
  const orderId = req.query.order_id || 'TEST-ORDER-1';
  const amount = req.query.amount || '1.00'; // 🔥 small amount for test

  const params = {
    clientid: nestpayConfig.clientId,
    oid: orderId,
    amount: amount,
    currency: nestpayConfig.currency, // 949
    TranType: nestpayConfig.tranType, // Auth
    storetype: nestpayConfig.storeType, // 3D_PAY_HOSTING
    lang: nestpayConfig.lang, // tr
    rnd: Date.now().toString(),

    okurl: `${nestpayConfig.baseUrl}/api/payment/response`,
    failUrl: `${nestpayConfig.baseUrl}/api/payment/response`,
  };

  const hash = generateHashV3(params, nestpayConfig.storeKey);

  let formHtml = `
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="${nestpayConfig.gatewayUrl}">
  `;

  for (const key in params) {
    formHtml += `<input type="hidden" name="${key}" value="${params[key]}" />`;
  }

  formHtml += `
          <input type="hidden" name="hash" value="${hash}" />
        </form>
        <p>Redirecting to secure payment...</p>
      </body>
    </html>
  `;

  console.log('🚀 Redirecting to Payten');
  res.send(formHtml);
});

/**
 * PAYMENT RESPONSE (OK + FAIL)
 * POST /api/payment/response
 */
router.post(
  '/response',
  express.urlencoded({ extended: true }),
  (req, res) => {
    console.log('🔔 Payten response received');
    console.log(req.body);

    const receivedHash = req.body.hash;
    const paramsForHash = { ...req.body };
    delete paramsForHash.hash;

    const calculatedHash = generateHashV3(
      paramsForHash,
      nestpayConfig.storeKey
    );

    if (receivedHash !== calculatedHash) {
      console.error('❌ HASH MISMATCH');
      return res.status(400).send('HASH MISMATCH');
    }

    if (req.body.Response === 'Approved') {
      console.log('✅ PAYMENT APPROVED');
      console.log('Order ID:', req.body.oid);

      return res.send(`
        <h1>Payment Successful</h1>
        <p>Order: ${req.body.oid}</p>
      `);
    } else {
      console.log('❌ PAYMENT FAILED');

      return res.send(`
        <h1>Payment Failed</h1>
        <p>Please try again.</p>
      `);
    }
  }
);

export default router;
