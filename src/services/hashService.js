import crypto from 'crypto';
import { escapeValue } from '../utils/escapeValue.js';
import { sortParams } from '../utils/sortParams.js';

export function generateHashV3(params, storeKey) {
  const sortedKeys = sortParams(params);

  const hashString = sortedKeys
    .map((key) => escapeValue(params[key]))
    .join('|')
    .concat('|', storeKey);

  return crypto
    .createHash('sha512')
    .update(hashString)
    .digest('base64');
}

export function verifyHashV3(params, storeKey, receivedHash) {
  const calculatedHash = generateHashV3(params, storeKey);
  return calculatedHash === receivedHash;
}
