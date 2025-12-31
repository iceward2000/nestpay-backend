import express from 'express';
import { nestpayConfig } from '../config/nestpay.js';
import { generateHashV3 } from '../services/hashService.js';
import { getOrderByName, markOrderAsPaid } from '../services/shopifyService.js';

const router = express.Router();

/**
 * START PAYMENT
 * GET /api/payment/initiate?order_id=#1023
 */
router.get('/initiate', async (req, res) => {
  try {
    const orderName = req.query.order_id;

    if (!orderName) {
      return res.status(400).send('Missing order_id');
    }

    // 🔥 GET REAL ORDER + AMOUNT FROM SHOPIFY
    const { amount, currency } = await getOrderByName(orderName);

    console.log('💰 REAL ORDER AMOUNT:', amount, currency);

    const params = {
      clientid: nestpayConfig.clientId,
      amount: amount,
      currency: nestpayConfig.currency, // Payten expects numeric (949)
      TranType: nestpayConfig.tranType,
      storetype: nestpayConfig.storeType,
      lang: nestpayConfig.lang,
      hashAlgorithm: 'ver3',

      okurl: `${nestpayConfig.baseUrl}/api/payment/success`,
      failUrl: `${nestpayConfig.baseUrl}/api/payment/fail`,

      rnd: Date.now().toString(),
      Instalment: '',
      oid: orderName,
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

    res.send(formHtml);
  } catch (err) {
    console.error('❌ INITIATE ERROR', err);
    res.status(500).send('Payment initiation failed');
  }
});

/**
 * PAYTEN SUCCESS CALLBACK
 */
router.post('/success', async (req, res) => {
  try {
    console.log('✅ PAYTEN SUCCESS CALLBACK');
    console.log(req.body);

    const orderName = req.body.oid;
    const paidAmount = req.body.amount;

    if (!orderName) {
      throw new Error('Missing oid in success callback');
    }

    // 1️⃣ Get Shopify order
    const { id: orderId, currency } = await getOrderByName(orderName);

    // 2️⃣ Capture payment in Shopify
    await markOrderAsPaid(orderId, paidAmount, currency);

    // 3️⃣ Redirect customer
    return res.redirect(302, 'https://lazika.com.tr/account/orders');
  } catch (err) {
    console.error('❌ SUCCESS HANDLER ERROR', err);
    return res.redirect(302, 'https://lazika.com.tr/account/orders');
  }
});

/**
 * FAIL CALLBACK
 */
router.post('/fail', (req, res) => {
  console.log('❌ PAYTEN FAIL CALLBACK');
  console.log(req.body);

  return res.redirect(302, 'https://lazika.com.tr/account/orders');
});

export default router;
