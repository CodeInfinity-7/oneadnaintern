const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generatePayslipPDF(employee, salaryEntry, verificationUrl, company) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  const primaryColor = '#6224E1';
  const white = '#FFFFFF';
  const black = '#000000';


  const fontBold = path.join(__dirname, '../../assets/Noto_Sans/static/NotoSans-Bold.ttf');
doc.registerFont('CustomBold', fontBold);

  // ✅ Register NotoSans font to support ₹
  const fontPath = path.join(__dirname, '../../assets/Noto_Sans/NotoSans-Regular.ttf');
  doc.registerFont('Custom', fontPath);
  // Header background
  doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);

  // OnePayslip title and logo in header
  const logoPath = path.join(__dirname, '../../assets/onepaysliplogo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 45, 22, {height:40, width: 43 });
  }
console.time('PDF_GENERATION');
// ... existing code
console.timeEnd('PDF_GENERATION');

  doc
    .fillColor(white)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('OnePayslip', 90, 25);

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(company?.name || 'Company Name', 90, 50);

    if (company?.address || company?.contact_email || company?.contact_phone) {
  const contactLine = [
    company?.address || '',
    company?.contact_email ? `Email: ${company.contact_email}` : '',
    company?.contact_phone ? `Phone: ${company.contact_phone}` : ''
  ]
    .filter(Boolean)
    .join('   |   '); // Use separator

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(white)
    .text(contactLine, 90, 68, {
      width: doc.page.width - 100
    });
}


  // Move below the header
  doc.moveDown(3);

  // Payslip title centered and bold
  doc
    .fontSize(20)
    .fillColor(black)
    .font('Helvetica-Bold')
    .text('SALARY SLIP', 0, doc.y, { align: 'center' });

  doc.moveDown(0.8);

  const infoLeftX = 50;
  const infoRightX = 320;
  let y = doc.y;

  doc
    .fontSize(11)
    .fillColor(black)
    .font('Helvetica-Bold')
    .text('Employee Name:', infoLeftX, y);
  doc.font('Helvetica').text(employee.full_name, infoLeftX + 110, y);
  y = doc.y + 3;

  doc.font('Helvetica-Bold').text('Employee ID:', infoLeftX, y);
  doc.font('Helvetica').text(employee.id.toString(), infoLeftX + 110, y);
  y = doc.y + 3;

  doc.font('Helvetica-Bold').text('Email:', infoLeftX, y);
  doc.font('Helvetica').text(employee.email || 'N/A', infoLeftX + 110, y);
  y = doc.y + 3;

  let yRight = doc.y - 39;
  doc.font('Helvetica-Bold').text('Designation:', infoRightX, yRight);
  doc.font('Helvetica').text(employee.designation || 'N/A', infoRightX + 90, yRight);
  yRight = doc.y + 3;

  const nextY = Math.max(y, yRight) + 10;
  doc.moveTo(infoLeftX, nextY - 5).lineTo(doc.page.width - infoLeftX, nextY - 5).strokeColor(primaryColor).lineWidth(0.8).stroke();

  doc.y = nextY;

  const tableTop = doc.y;
  const headerHeight = 20;
  doc
    .rect(infoLeftX, tableTop, doc.page.width - 2 * infoLeftX, headerHeight)
    .fill(primaryColor);

  doc
    .fillColor(white)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Description', infoLeftX + 5, tableTop + 5, { width: 180 })
    .text('Earnings', infoLeftX + 190, tableTop + 5, { width: 100, align: 'right' })
    .text('Deductions', infoLeftX + 300, tableTop + 5, { width: 100, align: 'right' });

  doc
    .strokeColor(primaryColor)
    .lineWidth(0.5)
    .moveTo(infoLeftX, tableTop + headerHeight)
    .lineTo(doc.page.width - infoLeftX, tableTop + headerHeight)
    .stroke();

  const rowHeight = 20;
  let rowY = tableTop + headerHeight + 5;

  function drawRow(description, earning, deduction, yPos) {
    doc
      .fillColor(black)
      .font('Custom')
      .fontSize(11)
      .text(description, infoLeftX + 8, yPos, { width: 180 })
      .text(earning, infoLeftX + 190, yPos, { width: 100, align: 'right' })
      .text(deduction, infoLeftX + 300, yPos, { width: 100, align: 'right' });
    doc
      .strokeColor('#eee')
      .lineWidth(0.4)
      .moveTo(infoLeftX, yPos + rowHeight - 5)
      .lineTo(doc.page.width - infoLeftX, yPos + rowHeight - 5)
      .stroke();
  }

  drawRow('Base Salary', `₹${Number(salaryEntry.base_salary).toFixed(2)}`, '-', rowY);
  rowY += rowHeight;
  drawRow('Bonus', `₹${Number(salaryEntry.bonus).toFixed(2)}`, '-', rowY);
  rowY += rowHeight;
  drawRow('Deductions', '-', `₹${Number(salaryEntry.deductions).toFixed(2)}`, rowY);
  rowY += rowHeight;

  doc
    .font('CustomBold')
    .fillColor(primaryColor)
    .fontSize(12)
    .text('Total', infoLeftX + 8, rowY, { width: 180 })
    .text(
      `₹${(Number(salaryEntry.base_salary) + Number(salaryEntry.bonus)).toFixed(2)}`,
      infoLeftX + 190,
      rowY,
      { width: 100, align: 'right' }
    )
    .text(`₹${Number(salaryEntry.deductions).toFixed(2)}`, infoLeftX + 300, rowY, {
      width: 100,
      align: 'right',
    });

  rowY += rowHeight + 10;
  doc.y = rowY;

  const netPayHeight = 30;
  doc
    .rect(infoLeftX, doc.y, doc.page.width - 2 * infoLeftX, netPayHeight)
    .fill(primaryColor);

  doc
    .fillColor(white)
    .fontSize(14)
    .font('CustomBold')
    .text(
      `NET PAY: ₹${Number(salaryEntry.total_amount).toFixed(2)}`,
      infoLeftX + 10,
      doc.y + 8
    );

  doc.moveDown(2);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(black)
    .text(
      `Payment Date: ${new Date(salaryEntry.created_at).toLocaleDateString()}`,
      { align: 'left' }
    );

  doc.moveDown(1);

  const boxTop = doc.y;
  const boxHeight = 140;
   doc
    .rect(infoLeftX, boxTop, doc.page.width - 2 * infoLeftX, boxHeight)
    .fill('#F0F0F0');

  doc
    .rect(infoLeftX, boxTop, doc.page.width - 2 * infoLeftX, boxHeight)
    .strokeColor(primaryColor)
    .lineWidth(1)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(primaryColor)
    .text('Verification QR Code', infoLeftX, boxTop + 10, {
      align: 'center',
      width: doc.page.width - 2 * infoLeftX
    });

  const qrDataUrl = await QRCode.toDataURL(verificationUrl);
  doc.image(qrDataUrl, doc.page.width / 2 - 45, boxTop + 30, {
    fit: [90, 90],
    align: 'center',
  });

  doc
    .fontSize(10)
    .fillColor(black)
    .text('Scan the QR code to verify this payslip', infoLeftX, boxTop + 125, {
      align: 'center',
      width: doc.page.width - 2 * infoLeftX
    });

  doc.moveDown(2);
  doc
    .fontSize(9)
    .fillColor(black)
    .text('For any queries, contact HR at oneadna@gmail.com', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
}

module.exports = generatePayslipPDF;
