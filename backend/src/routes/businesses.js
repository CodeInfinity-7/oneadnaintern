const express = require('express');
const router = express.Router(); 
const knex = require("../db");
const upload = require('../middleware/upload'); // KYC file upload middleware

// GET /businesses with optional search and pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  try {
    const baseQuery = knex('businesses')
      .where(builder => {
        if (search) {
          builder
            .where('name', 'ilike', `%${search}%`)
            .orWhere('owner', 'ilike', `%${search}%`);
        }
      });

    const total = await baseQuery.clone().count('* as count').first();

    const data = await baseQuery
      .clone()
      
      .offset(offset)
      .limit(limit)
      .leftJoin('kyc_files', 'businesses.id', 'kyc_files.business_id')
.groupBy('businesses.id')
.select(
  'businesses.*',
  knex.raw("COALESCE(json_agg(kyc_files.filepath) FILTER (WHERE kyc_files.filepath IS NOT NULL), '[]') AS kycFiles")
)

    res.json({
      data,
      total: parseInt(total.count),
      page,
      limit,
      totalPages: Math.ceil(total.count / limit),
    });
  } catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// GET /businesses/:id (for testing)
router.get('/:id', async (req, res) => {
  try {
    const business = await knex('businesses').where({ id: req.params.id }).first();
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (err) {
    console.error('Error fetching business by ID:', err);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// POST /businesses
router.post('/', async (req, res) => {
  const { name, owner, email, phone, address } = req.body;

  try {
    const existingBusiness = await knex('businesses').where({ name }).first();
    if (existingBusiness) {
      return res.status(400).json({ error: 'Business name already exists' });
    }

    const [newBusiness] = await knex('businesses')
      .insert({ name, owner, email, phone, address })
      .returning('*');

    res.status(201).json(newBusiness);
  } catch (err) {
    console.error('Error creating business:', err);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

// PUT /businesses/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, owner, email, phone, address } = req.body;

  try {
    const existingBusiness = await knex('businesses')
      .where({ name })
      .andWhereNot({ id })
      .first();

    if (existingBusiness) {
      return res.status(400).json({ error: 'Business name already exists' });
    }

    const updated = await knex('businesses')
      .where({ id })
      .update({ name, owner, email, phone, address })
      .returning('*');

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating business:', err);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// DELETE /businesses/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await knex('businesses').where({ id }).del();

    if (deleted === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting business:', err);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

// POST /businesses/:id/kyc - Upload KYC file
router.post('/:id/kyc', upload.single('kyc'), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    await knex('kyc_files').insert({
      business_id: id,
      filename: file.originalname,
     filepath: `uploads/${file.filename}`,
           mimetype: file.mimetype,
      size: file.size,
    });

    return res.status(201).json({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving file' });
  }
});

module.exports = router;
