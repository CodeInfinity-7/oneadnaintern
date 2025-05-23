const express = require('express');
const router = express.Router(); 
const knex = require('knex')(require('../../knexfile').development);

// GET /businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await knex('businesses').select('*');
    res.json(businesses);
  } catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// POST /businesses
router.post('/', async (req, res) => {
  const { name, owner, email, phone, address } = req.body;

  try {
    const [newBusiness] = await knex('businesses')
      .insert({ name, owner, email, phone, address })
      .returning('*');

    res.status(201).json(newBusiness);
  } catch (err) {
    console.error('Error inserting business:', err);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

module.exports = router;
