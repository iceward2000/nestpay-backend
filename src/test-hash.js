import { generateHashV3 } from './services/hashService.js';

const params = {
  amount: '95.93',
  BillToCompany: 'billToCompany',
  BillToName: 'name',
  callbackUrl: 'http://test/callback',
  clientid: '100200127',
  currency: '949',
  failUrl: 'http://test/fail',
  hashAlgorithm: 'ver3',
  Instalment: '',
  lang: 'tr',
  okurl: 'http://test/ok',
  refreshtime: '5',
  rnd: '87954458746',
  storetype: '3D',
  TranType: 'Auth'
};

console.log(generateHashV3(params, 'TEST1234'));
