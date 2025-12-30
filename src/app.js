import express from 'express';
import paymentRoutes from './routes/payment.js';
import callbackRoutes from './routes/callback.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/payment', paymentRoutes);
app.use('/api/payment', callbackRoutes);

app.get('/payment/success', (req, res) => {
  res.send('<h1>Payment Successful</h1>');
});

app.get('/payment/fail', (req, res) => {
  res.send('<h1>Payment Failed</h1>');
});

export default app;
