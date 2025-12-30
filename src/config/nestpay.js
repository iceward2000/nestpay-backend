import dotenv from 'dotenv';
dotenv.config();


export const nestpayConfig = {
    clientId: process.env.NESTPAY_CLIENT_ID,
    storeKey: process.env.NESTPAY_STORE_KEY,
    gatewayUrl: process.env.NESTPAY_GATEWAY_URL,
    storeType: '3D_PAY_HOSTING',
    lang: 'tr',
    currency: '949', // TRY
    tranType: 'Auth',
    hashAlgorithm: 'ver3'
  };
  