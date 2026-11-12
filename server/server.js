require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const fs = require('fs');
const connectDB = require('./config/db');

fs.mkdirSync('uploads', { recursive: true });
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '10kb' }));
app.use(sanitize()); // strips $ and . keys to block NoSQL injection

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/payments', require('./routes/payments'));

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid request' });
  if (err.code === 11000) return res.status(409).json({ message: 'That email is already registered' });
  if (err.name === 'MulterError' || /^Only /.test(err.message)) return res.status(400).json({ message: err.message });
  console.error(err.message);
  res.status(500).json({ message: 'Something went wrong' });
});

connectDB().then(() => app.listen(process.env.PORT || 5000, () => console.log('API running')));
