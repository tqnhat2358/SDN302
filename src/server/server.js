const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
//const adminUserRoutes = require('./routes/admin/adminUserRoutes');
//const adminBookRoutes = require('./routes/admin/adminBookRoutes');
//const adminOrderRoutes = require('./routes/admin/adminOrderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

require('dotenv').config();
const app = express();


app.use("/api/notifications", notificationRoutes);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Use routes
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
//app.use('/api/admin/users', adminUserRoutes);
//app.use('/api/admin/books', adminBookRoutes);
//app.use('/api/admin/orders', adminOrderRoutes);


//Front end
app.use(express.static(path.join(__dirname, '../client')));

const staticPages = [
  'shop',
  'cart',
  'profile',
  'books',
  'book_detail',
  'index',
  'register',
  'users',
  'login',
  'orders'
];

staticPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `../client/${page}.html`));
  });
});

app.get('/book_detail/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/book_detail.html'));
});


const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




