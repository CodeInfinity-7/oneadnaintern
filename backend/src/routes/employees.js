const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeesController");
const { upload, bulkUploadEmployees } = require("../controllers/employeesController");
const { employeeSchema } = require("../validations/employeeValidation");
const authenticateToken = require('../middleware/auth');

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /employees?page=&limit=&search=
router.get("/", controller.getEmployees);

// New route: get employees by business ID
router.get('/business/:business_id', controller.getEmployeesByBusinessId);

// GET /employees/:id
router.get("/:id", controller.getEmployeeById);

// POST /employees
router.post("/", validate(employeeSchema), controller.createEmployee);

// POST /employees/bulk-upload
router.post("/bulk-upload", upload.single("file"), bulkUploadEmployees);

// PUT /employees/:id
router.put("/:id", validate(employeeSchema), controller.updateEmployee);

// DELETE /employees/:id
router.delete("/:id", controller.deleteEmployee);

module.exports = router;

