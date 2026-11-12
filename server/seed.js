require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: 'admin@demo.com' });
  await User.create({ name: 'Admin', email: 'admin@demo.com', role: 'admin', passwordHash: await bcrypt.hash('Admin@12345', 12) });
  console.log('Seeded admin only: admin@demo.com / Admin@12345');
  process.exit();
})();
