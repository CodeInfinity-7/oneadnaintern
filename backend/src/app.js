const express = require('express');
const cors = require('cors');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
// Middleware
app.use(express.json());
const logRequests = require('./middleware/logger');
app.use(logRequests);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const businessesRoute = require('./routes/businesses');
const employeesRoute = require('./routes/employees');
const authRoutes = require('./routes/auth');

app.use('/businesses', businessesRoute);
app.use('/employees', employeesRoute);
app.use('/auth', authRoutes);
app.use('/salaries', require('./routes/salaries'));

// Swagger setup (ONLY use this block)
const swaggerDocument = YAML.load('./docs/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Hello API' });
});

module.exports = app;
