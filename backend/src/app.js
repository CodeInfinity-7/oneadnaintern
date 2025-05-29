
// src/app.js
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS BEFORE any routes
app.use(cors({
  origin: 'http://localhost:3000', // your frontend's origin
  credentials: true
}));

app.use(express.json());

// Import the businesses route
const businessesRoute = require('./routes/businesses');

// Use the businesses route at /businesses
app.use('/businesses', businessesRoute);

app.get('/', (req, res) => {
  res.json({ message: 'Hello API' });
});
app.use('/uploads', express.static('uploads')); // serve uploaded files
app.use('/businesses', businessesRoute);


module.exports = app;
