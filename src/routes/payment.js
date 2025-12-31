import express from 'express';
import { nestpayConfig } from '../config/nestpay.js';
import { generateHashV3 } from '../services/hashService.js';
import fetch from 'node-fetch';
import { markOrderAsPaid } from '../services/shopifyService.js';


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


router.post('/success', async (req, res) => {
  try {
    console.log('✅ PAYMENT SUCCESS');
    console.log(req.body);

    const orderName = req.body.oid; // e.g. "#1023"
    const amount = req.body.amount;

    const shop = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;

    // 1️⃣ Find order by name
    const searchRes = await fetch(
      `https://${shop}/admin/api/2024-01/orders.json?name=${encodeURIComponent(orderName)}`,
      {
        headers: {
          'X-Shopify-Access-Token': token,
        },
      }
    );

    const searchData = await searchRes.json();
    const order = searchData.orders?.[0];

    if (!order) {
      throw new Error(`Order not found: ${orderName}`);
    }

    // 2️⃣ Mark order as paid
    await markOrderAsPaid(order.id, amount);

    // 3️⃣ Redirect customer safely
    return res.redirect(302, 'https://lazika.com.tr/account/orders');
  } catch (err) {
    console.error('❌ PAYMENT SUCCESS ERROR', err);
    return res.redirect(302, 'https://lazika.com.tr/account/orders');
  }
});

router.get('/success', (req, res) => {
  return res.redirect(302, 'https://lazika.com.tr/account/orders');
});


// FAIL
router.post('/fail', (req, res) => {
  console.log('❌ PAYMENT FAILED');
  console.log(req.body);

  res.send(`
    <h1>Payment Failed</h1>
    <p>Please try again.</p>
  `);
});

router.get('/fail', (req, res) => {
  res.send(`
    <h1>Payment Failed</h1>
    <p>Please try again.</p>
  `);
});

export default router;
