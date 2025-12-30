import express from 'express';
import { nestpayConfig } from '../config/nestpay.js';
import { generateHashV3 } from '../services/hashService.js';

const router = express.Router();

router.get('/initiate', (req, res) => {
    res.send(`
      <html>
        <body>
          <h2>Test Payment Start</h2>
          <form method="POST" action="/api/payment/initiate">
            <input type="hidden" name="orderId" value="TEST-ORDER-1" />
            <input type="hidden" name="amount" value="100.00" />
            <button type="submit">Start Payment</button>
          </form>
        </body>
      </html>
    `);
  });
  
  

router.post('/initiate', (req, res) => {
console.log('Using gateway URL:', nestpayConfig.gatewayUrl);


  // TEMP: hardcoded test values (Shopify comes later)
  const orderId = req.body.orderId || 'ORDER123';
  const amount = req.body.amount || '100.00';

  const params = {
    clientid: nestpayConfig.clientId,
    amount: amount,
    currency: nestpayConfig.currency,
    TranType: nestpayConfig.tranType,
    storetype: nestpayConfig.storeType,
    lang: nestpayConfig.lang,
    hashAlgorithm: nestpayConfig.hashAlgorithm,

    okurl: 'http://localhost:3000/payment/success',
    failUrl: 'http://localhost:3000/payment/fail',
    callbackUrl: 'http://localhost:3000/api/payment/callback',

    rnd: Date.now().toString(),
    Instalment: '',
    oid: orderId
  };

  const hash = generateHashV3(params, nestpayConfig.storeKey);

  params.hash = hash;

  // Build auto-submit form
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
  console.log('FORM HTML:\n', formHtml);

  res.send(formHtml);
});

export default router;
