import fetch from 'node-fetch';
import { shopifyConfig } from '../config/shopify.js';

/**
 * Get order by ORDER NAME (ex: #1023)
 * Returns: { id, amount, currency }
 */
export async function getOrderByName(orderName) {
  const url = `https://${shopifyConfig.store}/admin/api/${shopifyConfig.apiVersion}/orders.json?name=${encodeURIComponent(orderName)}`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': shopifyConfig.accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify order search failed: ${text}`);
  }

  const data = await response.json();
  const order = data.orders?.[0];

  if (!order) {
    throw new Error(`Order not found for name: ${orderName}`);
  }

  return {
    id: order.id,
    amount: order.current_total_price,
    currency: order.currency,
  };
}

/**
 * Capture payment on Shopify
 */
export async function markOrderAsPaid(orderId, amount, currency = 'TRY') {
  const url = `https://${shopifyConfig.store}/admin/api/${shopifyConfig.apiVersion}/orders/${orderId}/transactions.json`;

  const payload = {
    transaction: {
      kind: 'capture',
      status: 'success',
      amount: amount,
      currency: currency,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': shopifyConfig.accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify capture failed: ${text}`);
  }

  return response.json();
}
