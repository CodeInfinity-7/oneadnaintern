// src/controllers/employeesController.js
const db = require("../db");
const pool = require('../db'); // your PostgreSQL client (pg.Pool)


const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');

// Configure multer for file uploads (in-memory or temp folder)
const upload = multer({ dest: 'uploads/' });
exports.upload = upload; // export multer to use in your route

// GET /employees?page=&limit=&search=&business_id=
// Example controller logic (Node.js + Knex)
exports.getEmployeeById = async (req, res) => {
  const id = parseInt(req.params.id); // this is correct
  try {
    const employee = await db("employees").where({ id }).first(); // 👈 Knex syntax
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getEmployees = async (req, res) => {
  const { business_id, page = 1, limit = 100, search = '' } = req.query;

  try {
    const query = db("employees");

    if (business_id) {
      query.where({ business_id });
    }

    if (search) {
      query.andWhere((qb) => {
        qb.where("full_name", "ilike", `%${search}%`)
          .orWhere("designation", "ilike", `%${search}%`)
          .orWhere("email", "ilike", `%${search}%`);
      });
    }

    const total = await query.clone().count().first();
    const employees = await query
      .orderBy("id", "desc")
      .limit(limit)
      .offset((page - 1) * limit);

    res.json({
  employees,
  total: parseInt(total.count),
  page: Number(page),
  limit: Number(limit),
});

  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};
// In your employeesController.js

// GET /employees/business/:business_id
exports.getEmployeesByBusinessId = async (req, res) => {
  const businessId = parseInt(req.params.business_id, 10);

  if (!businessId) {
    return res.status(400).json({ error: "Invalid or missing business_id" });
  }

  try {
    const employees = await db("employees")
      .where({ business_id: businessId })
      .orderBy("id", "desc");

    res.json({ data: employees, total: employees.length });
  } catch (err) {
    console.error("Error fetching employees by business_id:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};


exports.createEmployee = async (req, res) => {
  try {
    const [inserted] = await db("employees").insert(req.body).returning("id");
    const newId = inserted.id || inserted; // handles both { id: 5 } and just 5
    res.status(201).json({ id: newId });
  } catch (err) {
    console.error("Error in createEmployee:", err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};


exports.updateEmployee = async (req, res) => {
 const id = parseInt(req.params.id, 10);

  try {
    const count = await db("employees").where({ id }).update(req.body);
    if (count === 0) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update employee" });
  }
};

exports.deleteEmployee = async (req, res) => {
  const id = parseInt(req.params.id, 10); // ⬅ convert to number
  try {
    const count = await db("employees").where({ id }).del();
    if (count === 0) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error(err); // helpful for debugging
    res.status(500).json({ error: "Failed to delete employee" });
  }
};
exports.bulkUploadEmployees = async (req, res) => {
  const results = [];
  const errors = [];

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        const {business_id, full_name, designation, mobile, email } = row;

        if (!business_id || !full_name || !designation || !mobile || !email) {
          errors.push({ row, reason: 'Missing required fields' });
        } else {
          results.push({
          business_id: parseInt(business_id),
            full_name,
            designation,
            mobile,
            email
            
          });
        }
      })
      .on('end', async () => {
        try {
          await db('employees').insert(results); // Bulk insert
          res.json({
            inserted: results.length,
            failed: errors,
          });
        } catch (insertErr) {
          console.error('DB Insert Error:', insertErr);
          res.status(500).json({ error: 'Failed to insert employees' });
        }
      });
  } catch (err) {
    console.error('CSV Upload Error:', err);
    res.status(500).json({ error: 'Error processing CSV file' });
  }
};

