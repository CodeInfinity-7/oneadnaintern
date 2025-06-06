// routes/salaries.js
const express = require('express');
const router = express.Router();
const path = require('path');
const knexConfig = require(path.resolve(__dirname, '../../knexfile.js'));
const knex = require('knex')(knexConfig.development);
const authenticateToken = require('../middleware/auth');

// Calculate Salary (POST /salaries/calculate)
router.post('/calculate', authenticateToken, (req, res) => {
  try {
    const { base_salary, bonus = 0, deductions = 0 } = req.body;
    if (base_salary == null) {
      return res.status(400).json({ error: 'Base salary is required' });
    }
    const total_amount = Number(base_salary) + Number(bonus) - Number(deductions);
    res.json({ total_amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save Salary (POST /salaries)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, base_salary, bonus = 0, deductions = 0 } = req.body;
    if (!employee_id || base_salary == null) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    const total_amount = Number(base_salary) + Number(bonus) - Number(deductions);
    const [insertedId] = await knex('salary_entries')
      .insert({ employee_id, base_salary, bonus, deductions, total_amount })
      .returning('id');

    res.json({
      id: insertedId?.id || insertedId,
      total_amount,
      bonus,
      deductions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Salaries by Employee (GET /salaries?employee_id=...)
router.get('/', async (req, res) => {
  const { employee_id } = req.query;
  if (!employee_id) {
    return res.status(400).json({ error: 'employee_id is required' });
  }

  try {
    const salaries = await knex('salary_entries')
      .where({ employee_id })
      .orderBy('created_at', 'desc');

    res.json(salaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch salaries' });
  }
});

module.exports = router;
