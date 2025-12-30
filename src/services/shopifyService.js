import fetch from 'node-fetch';
import { shopifyConfig } from '../config/shopify.js';


export async function markOrderAsPaid(orderId, amount, currency = 'TRY') {
  const url = `https://${shopifyConfig.store}/admin/api/${shopifyConfig.apiVersion}/orders/${orderId}/transactions.json`;

  const payload = {
    transaction: {
      kind: 'capture',
      status: 'success',
      amount: amount,
      currency: currency
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': shopifyConfig.accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error: ${errorText}`);
  }

  return response.json();
}
