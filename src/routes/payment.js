import express from 'express';
import { nestpayConfig } from '../config/nestpay.js';
import { generateHashV3 } from '../services/hashService.js';

const router = express.Router();

/**
 * START PAYMENT
 * GET /api/payment/initiate
 */
router.get('/initiate', (req, res) => {
  const orderId = req.query.order_id || 'TEST-ORDER-1';
  const amount = req.query.amount || '1.00';

  const params = {
    clientid: nestpayConfig.clientId,
    amount: amount,
    currency: nestpayConfig.currency,
    TranType: nestpayConfig.tranType,
    storetype: nestpayConfig.storeType,
    lang: nestpayConfig.lang,
    hashAlgorithm: 'ver3',

    okurl: `${nestpayConfig.baseUrl}/payment/success`,
    failUrl: `${nestpayConfig.baseUrl}/payment/fail`,

    rnd: Date.now().toString(),
    Instalment: '',
    oid: orderId,
  };

  const hash = generateHashV3(params, nestpayConfig.storeKey);
  params.hash = hash;

  let formHtml = `
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="${nestpayConfig.gatewayUrl}">
  `;

  for (const key in params) {
    formHtml += `<input type="hidden" name="${key}" value="${params[key]}" />`;
  }

  formHtml += `
        </form>
        <p>Redirecting to secure payment...</p>
      </body>
    </html>
  `;

  console.log('🚀 PAYTEN FORM GENERATED');
  res.send(formHtml);
});

export default router;
