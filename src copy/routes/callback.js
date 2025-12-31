import express from 'express';
import { nestpayConfig } from '../config/nestpay.js';
import { verifyHashV3 } from '../services/hashService.js';
import { markOrderAsPaid } from '../services/shopifyService.js';

const router = express.Router();

router.post('/callback', async (req, res) => {
  console.log('🔔 CALLBACK RECEIVED');
  console.log('BODY:', req.body);

  const receivedHash = req.body.HASH || req.body.hash;
  if (!receivedHash) {
    console.error('❌ CALLBACK ERROR: No HASH');
    return res.status(400).send('NO HASH');
  }

  const params = { ...req.body };
  delete params.HASH;
  delete params.hash;

  const isValid = verifyHashV3(
    params,
    nestpayConfig.storeKey,
    receivedHash
  );

  if (!isValid) {
    console.error('❌ CALLBACK ERROR: HASH MISMATCH');
    return res.status(400).send('HASH ERROR');
  }

  console.log('✅ HASH VERIFIED');

  const mdStatus = req.body.mdStatus;
  const response = req.body.Response;
  const orderId = req.body.oid;
  const amount = req.body.amount;

  if (mdStatus === '1' && response === 'Approved') {
    console.log(`💰 PAYMENT SUCCESS | Order: ${orderId}`);

    try {
      await markOrderAsPaid(orderId, amount);
      console.log('✅ Shopify order marked as PAID');
    } catch (err) {
      console.error('❌ Shopify update failed:', err.message);
    }
  } else {
    console.log(`❌ PAYMENT FAILED | Order: ${orderId}`);
  }

  res.status(200).send('OK');
});

export default router;
