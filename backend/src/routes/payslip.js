const express = require('express');
const router = express.Router();
const db = require('../db');
const generatePayslipPDF = require('../utils/generatePayslip');
const crypto = require('crypto');

// QR secret
const secret = process.env.QR_SECRET || 'super-secret';

const fs = require('fs');
const path = require('path');


const pdfDir = path.join(__dirname, '..', 'pdfs_storage');




router.post('/generate', async (req, res) => {
  const { employee_id } = req.body;
  if (!employee_id) return res.status(400).json({ error: 'Missing employee_id' });

  try {
    const employee = await db('employees').where({ id: employee_id }).first();
    const salaryEntry = await db('salary_entries')
      .where({ employee_id })
      .orderBy('created_at', 'desc')
      .first();

    if (!employee || !salaryEntry) {
      return res.status(404).json({ error: 'Employee or salary entry not found' });
    }

    const payslipMonth = salaryEntry.created_at.toISOString().slice(0, 7); // "YYYY-MM"

    // Check if payslip for this employee & month already exists
    const existingPayslip = await db('payslips')
      .join('salary_entries', 'payslips.salary_id', 'salary_entries.id')
      .where('payslips.employee_id', employee_id)
      .andWhereRaw(`TO_CHAR(salary_entries.created_at, 'YYYY-MM') = ?`, [payslipMonth])
      .select('payslips.pdf_url')
      .first();

    if (existingPayslip) {
      const existingPath = path.join(pdfDir, existingPayslip.pdf_url);
      if (fs.existsSync(existingPath)) {
        console.log('Payslip already exists. Sending existing PDF.');
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${existingPayslip.pdf_url}"`,
        });
        return res.sendFile(existingPath);
      }
    }

    // Generate hash and QR URL
    const payload = `${salaryEntry.id}:${employee.id}`;
    const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const verificationUrl = `http://localhost:3000/verify/${salaryEntry.id}?hash=${hash}`;

    // Get company info
    const business = await db('businesses').where({ id: employee.business_id }).first();
    const company = {
      name: business?.name,
      address: business?.address,
      contact_email: business?.email,
      contact_phone: business?.phone,
    };

    // Generate PDF
    const pdfBuffer = await generatePayslipPDF(employee, salaryEntry, verificationUrl, company);

    // Save PDF
    const fileName = `payslip_${employee_id}_${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Insert into payslips table
    await db('payslips').insert({
      employee_id,
      salary_id: salaryEntry.id,
      pdf_url: fileName,
      qr_code: hash,
    });

    // Send PDF to client
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.sendFile(filePath);

  } catch (err) {
    console.error('Error generating payslip:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/verify/:id', async (req, res) => {
  const { id } = req.params;
  const { hash } = req.query;

  const salaryEntry = await db('salary_entries').where({ id }).first();
  if (!salaryEntry)
    return res.status(404).json({ valid: false, error: 'Salary entry not found' });

  const employee = await db('employees').where({ id: salaryEntry.employee_id }).first();
  const payload = `${id}:${employee.id}`;
  const expectedHash = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  console.log('[VERIFY] Payload:', payload);
  console.log('[VERIFY] Expected Hash:', expectedHash);
  console.log('[VERIFY] Received Hash:', hash);

  if (hash !== expectedHash)
    return res.status(403).json({ valid: false, error: 'Hash mismatch or invalid QR code' });

  res.json({
    valid: true,
    employee: employee.full_name,
    date: salaryEntry.created_at,
    net_pay: Number(salaryEntry.total_amount)

  });
});

router.get('/latest', async (req, res) => {
  const { employee_id } = req.query;
  if (!employee_id) return res.status(400).json({ error: 'Missing employee_id' });

  try {
    const latest = await db('payslips')
      .where({ employee_id })
      .orderBy('created_at', 'desc')
      .first();

    if (!latest) {
      return res.status(404).json({ error: 'No payslip found' });
    }

    const filePath = path.join(pdfDir, latest.pdf_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${latest.pdf_url}"`,
    });
    res.sendFile(filePath);
  } catch (err) {
    console.error('Error fetching latest payslip:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/history/:employee_id', async (req, res) => {
  const { employee_id } = req.params;

  try {
    const payslips = await db('payslips')
      .join('salary_entries', 'payslips.salary_id', 'salary_entries.id')
      .where('payslips.employee_id', employee_id)
      .orderBy('salary_entries.created_at', 'desc')
      .select(
        'payslips.pdf_url',
        'salary_entries.created_at as salary_date',
        'payslips.qr_code'
      );

    res.json(payslips);

  } catch (err) {
    console.error('Error fetching payslip history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /payslips/generate:
 *   post:
 *     summary: Generate a payslip for an employee.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Returns PDF
 */

module.exports = router;
