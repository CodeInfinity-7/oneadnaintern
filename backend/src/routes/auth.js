const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Dummy user DB (use real DB in production)
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists in DB
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    await db('users').insert({
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db('users').where({ username }).first();
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
