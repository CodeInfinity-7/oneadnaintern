const app = require('./app'); // Import your Express app from app.js (or wherever it is)

// Don't redeclare express app again here!
// const express = require('express');
// const cors = require('cors');

// If you want to add cors here, do it on app, not a new express instance:
const cors = require('cors');

app.use(cors()); // Enable CORS on your imported app

const port = 4000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
