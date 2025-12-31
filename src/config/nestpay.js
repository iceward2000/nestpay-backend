import dotenv from 'dotenv';
dotenv.config();

//test
export const nestpayConfig = {
    clientId: process.env.PAYTEN_CLIENT_ID,
    storeKey: process.env.PAYTEN_STORE_KEY,
    gatewayUrl: process.env.PAYTEN_3D_URL,
    baseUrl: process.env.PAYTEN_BASE_URL,
    storeType: '3D_PAY_HOSTING',
    lang: 'tr',
    currency: '949', // TRY
    tranType: 'Auth',
    hashAlgorithm: 'ver3'
  };
  