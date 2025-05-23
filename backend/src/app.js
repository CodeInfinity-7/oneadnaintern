// src/app.js
const express = require('express');
const app = express();

// Import the businesses route
const businessesRoute = require('./routes/businesses');

app.use(express.json());

// Use the businesses route at /businesses
app.use('/businesses', businessesRoute);

app.get('/', (req, res) => {
  res.json({ message: 'Hello API' });
});

module.exports = app;
