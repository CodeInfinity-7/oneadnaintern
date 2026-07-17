const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../../knexfile').production);
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');


// GET /reports/summary?business_id=1&month=06&year=2025
router.get('/summary', async (req, res) => {
  const { business_id, month, year } = req.query;

  if (!business_id || !month || !year) {
    return res.status(400).json({ error: 'Missing query parameters' });
  }

  try {
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(Number(year), Number(month), 0).toISOString().split('T')[0];

    const result = await knex('salary_entries')
      .join('employees', 'salary_entries.employee_id', 'employees.id')
      .where('employees.business_id', business_id)
      .andWhereBetween('salary_entries.created_at', [startDate, endDate])
      .sum('salary_entries.base_salary as total_base_salary')
      .sum('salary_entries.bonus as total_bonus')
      .sum('salary_entries.deductions as total_deductions')
      .first();

    const total_base_salary = Number(result.total_base_salary || 0);
    const total_bonus = Number(result.total_bonus || 0);
    const total_deductions = Number(result.total_deductions || 0);

    res.json({
      business_id,
      month,
      year,
      total_base_salary,
      total_bonus,
      total_deductions,
      net_paid: total_base_salary + total_bonus - total_deductions,
    });
  } catch (error) {
    console.error('[SUMMARY ERROR]', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// GET /reports/details?business_id=1&start_date=2025-06-01&end_date=2025-06-30&page=1&limit=10
router.get('/details', async (req, res) => {
  const { business_id, start_date, end_date, page = 1, limit = 10 } = req.query;

  if (!business_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing query parameters' });
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const query = knex('salary_entries')
      .join('employees', 'salary_entries.employee_id', 'employees.id')
      .where('employees.business_id', business_id)
      .andWhereBetween('salary_entries.created_at', [start_date, end_date]);

    const totalRows = await query.clone().count('salary_entries.id as count').first();

    const rows = await query
      .clone()
      .select(
        'employees.id as employee_id',
        'employees.full_name',
        'salary_entries.base_salary',
        'salary_entries.bonus',
        'salary_entries.deductions',
        knex.raw(
          '(salary_entries.base_salary + salary_entries.bonus - salary_entries.deductions) as net_paid'
        )
      )
      .limit(limit)
      .offset(offset);

    const summary = rows.reduce(
      (acc, row) => {
        acc.total_base_salary += Number(row.base_salary);
        acc.total_bonus += Number(row.bonus);
        acc.total_deductions += Number(row.deductions);
        acc.total_net_paid += Number(row.net_paid);
        return acc;
      },
      {
        total_base_salary: 0,
        total_bonus: 0,
        total_deductions: 0,
        total_net_paid: 0,
      }
    );

    res.json({
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalRows.count),
      },
      details: rows,
      summary,
    });
  } catch (error) {
    console.error('[DETAILS ERROR]', error);
    res.status(500).json({ error: 'Failed to generate paginated report' });
  }
});

const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');



// Updated chart renderer with high resolution
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 1200,
  height: 500,
  backgroundColour: 'white',
  type: 'image/png',
  chartCallback: (ChartJS) => {
    ChartJS.defaults.responsive = false;
    ChartJS.defaults.plugins.legend.display = false;
    ChartJS.defaults.font.family = 'Noto Sans';
    ChartJS.defaults.font.size = 16;
    ChartJS.defaults.color = '#1F2937';
  },
});

// Finalized Bar Chart Generation Function
async function generateProfessionalBarChart(summaryData, businessName, businessId, outputPath) {
  const configuration = {
    type: 'bar',
    data: {
      labels: ['Base Salary', 'Bonus', 'Deductions'],
      datasets: [
        {
          label: 'Amount (₹)',
          data: [
            summaryData.total_base_salary || 0,
            summaryData.total_bonus || 0,
            summaryData.total_deductions || 0,
          ],
          backgroundColor: [
            'rgba(79, 70, 229, 0.9)',
            'rgba(79, 70, 229, 0.9)',
            'rgba(79, 70, 229, 0.9)'
          ],
          borderColor: [
            'rgb(67, 56, 202)',
            'rgb(67, 56, 202)',
            'rgb(67, 56, 202)'
          ],
          borderWidth: 3,
          borderRadius: 10,
          borderSkipped: false,
          barThickness: 80
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Payroll Analysis Overview',
          font: {
            size: 28,
            weight: 'bold',
            family: 'Noto Sans',
          },
          color: '#1F2937',
          padding: { top: 20, bottom: 30 },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.3)',
            lineWidth: 1.5,
          },
          ticks: {
            font: {
              size: 14,
              family: 'Noto Sans',
            },
            color: '#374151',
            callback: function (value) {
              return '₹' + value.toLocaleString('en-IN');
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 16,
              weight: 'bold',
              family: 'Noto Sans',
            },
            color: '#1F2937',
          },
        },
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 30,
          right: 30,
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration, 'image/png', {
    devicePixelRatio: 2,
  });
  fs.writeFileSync(outputPath, buffer);
}


// Optimized single-page PDF generation with watermark
const logoPath = path.join(__dirname, '../../assets/onepaysliplogo.png');

async function generateOptimizedPayrollPDF(rows, businessName, businessId, startDate, endDate, summary, res) {
  const fs = require('fs');
  const path = require('path');
  const PDFDocument = require('pdfkit');

  const fontRegular = path.resolve(__dirname, '../../assets/Noto_Sans/static/NotoSans-Regular.ttf');
  const fontBold = path.resolve(__dirname, '../../assets/Noto_Sans/static/NotoSans-Bold.ttf');

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    autoFirstPage: false,
    info: {
      Title: `Payroll Report - ${businessName}`,
      Author: 'OnePayslip',
      Subject: 'Professional Payroll Report',
      Keywords: 'payroll, report, salary, employees, onepayslip'
    }
  });

  doc.registerFont('NotoSans', fontRegular);
  doc.registerFont('NotoSans-Bold', fontBold);

  const margin = 40;
  const rowHeight = 28;
  const headerHeight = 32;
  const colWidths = [30, 130, 75, 75, 75, 80];
  const colX = colWidths.reduce((acc, w, i) => {
    acc.push((acc[i - 1] || margin) + (i ? colWidths[i - 1] : 0));
    return acc;
  }, []);
  const chartPath = './payroll_analysis_chart.png';

  let pageWidth, pageHeight, contentWidth;

  const addHeader = () => {
    doc.addPage();
    pageWidth = doc.page.width;
    pageHeight = doc.page.height;
    contentWidth = pageWidth - margin * 2;

   doc.rect(0, 0, pageWidth, 80).fill('#6224E1');


    if (fs.existsSync(logoPath)) {
  doc.image(logoPath, margin, 15, { width: 40, height: 40 });
}
doc.font('NotoSans-Bold').fontSize(22).fillColor('#FFFFFF')
   .text('OnePayslip', margin + 45, 14);  // slight Y tweak from 12 → 14
doc.font('NotoSans').fontSize(12.5).fillColor('#E0E7FF')
   .text('Professional Payroll Management', margin + 45, 40);  // moved up from 44 → 40


    const businessCardX = pageWidth - 260;
    doc.roundedRect(businessCardX, 12, 230, 56, 8).fillOpacity(0.15).fill('#FFFFFF').stroke('#E0E7FF', 1);
    doc.fillOpacity(1);
    doc.font('NotoSans-Bold').fontSize(11).fillColor('#FFFFFF').text('Business Details', businessCardX + 12, 20);
    doc.font('NotoSans-Bold').fontSize(14).fillColor('#E0E7FF')
      .text(businessName, businessCardX + 12, 35, { width: 200 });
    doc.font('NotoSans').fontSize(10).fillColor('#E0E7FF').text(`ID: ${businessId}`, businessCardX + 12, 52);
  };

  const addTableHeader = (y) => {
    doc.font('NotoSans-Bold').fontSize(14).fillColor('#1F2937').text('Employee Breakdown', margin, y);
    const headerY = y + 25;
    doc.roundedRect(margin, headerY, colWidths.reduce((a, b) => a + b), headerHeight, 6).fill('#1F2937');
    doc.fillColor('#FFFFFF').font('NotoSans-Bold').fontSize(10);
    ['S.no', 'Employee Name', 'Base Salary', 'Bonus', 'Deductions', 'Net Paid'].forEach((text, i) => {
      const textY = headerY + (headerHeight - 10) / 2;
      doc.text(text, colX[i] + 8, textY, {
        width: colWidths[i] - 16,
        align: i === 0 ? 'center' : 'left'
      });
    });
    return headerY + headerHeight;
  };

  // Begin PDF
  console.log('[PDF] Starting PDF generation for business:', businessName);
  addHeader();

  const titleY = 95;
  doc.font('NotoSans-Bold').fontSize(20).fillColor('#1F2937')
    .text('Payroll Report', margin, titleY, { align: 'center' });

  const periodY = titleY + 30;
  doc.roundedRect(margin, periodY, contentWidth, 35, 8).fill('#F8FAFC').stroke('#E2E8F0', 1);
  doc.font('NotoSans-Bold').fontSize(12).fillColor('#374151').text('Report Period', margin + 20, periodY + 8);
  doc.font('NotoSans').fontSize(11).fillColor('#6B7280')
    .text(`${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}`, margin + 20, periodY + 22);

  const metricsY = periodY + 50;
  const metricCardWidth = (contentWidth - 30) / 3;
  const metricCardHeight = 65;
  const metrics = [
    { title: 'Total Base Salary', value: summary.total_base_salary },
    { title: 'Total Bonus', value: summary.total_bonus },
    { title: 'Total Deductions', value: summary.total_deductions }
  ];
  metrics.forEach((metric, index) => {
    const cardX = margin + index * (metricCardWidth + 15);
    doc.rect(cardX, metricsY, metricCardWidth, metricCardHeight).fill('#EEF2FF').stroke('#C7D2FE', 1);
 // Draw circle
doc.circle(cardX + 18, metricsY + 20, 10).fill('#4F46E5');

// Centered ₹ inside circle
doc.font('NotoSans-Bold').fontSize(12).fillColor('#FFFFFF')
   .text('₹', cardX + 13, metricsY + 14, { width: 10, align: 'center' });

    doc.font('NotoSans-Bold').fontSize(9).fillColor('#6B7280').text(metric.title, cardX + 35, metricsY + 12);
    doc.font('NotoSans-Bold').fontSize(14).fillColor('#4F46E5')
      .text(`₹${metric.value.toLocaleString('en-IN')}`, cardX + 35, metricsY + 28);
  });

  const netY = metricsY + metricCardHeight + 15;
  const netPaid = summary.total_base_salary + summary.total_bonus - summary.total_deductions;
  doc.roundedRect(margin, netY, contentWidth, 40, 8).fill('#F0FDF4').stroke('#22C55E', 2);
  doc.font('NotoSans-Bold').fontSize(13).fillColor('#15803D').text('Net Amount Disbursed', margin + 25, netY + 8);
  doc.font('NotoSans-Bold').fontSize(18).fillColor('#15803D')
    .text(`₹${netPaid.toLocaleString('en-IN')}`, margin + 25, netY + 22);

  let y = netY + 55;
  y = addTableHeader(y);

  for (let i = 0; i < rows.length; i++) {
    if (y + rowHeight > pageHeight - 100) {
      addHeader();
      y = addTableHeader(margin);
    }

    const row = rows[i];
    const isEven = i % 2 === 0;
    const rowColor = isEven ? '#FFFFFF' : '#F9FAFB';
    doc.rect(margin, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(rowColor).stroke('#E5E7EB', 0.5);

    const values = [
      (i + 1).toString(),
      row.full_name.length > 18 ? row.full_name.substring(0, 18) + '...' : row.full_name,
      `₹${Number(row.base_salary).toLocaleString('en-IN')}`,
      `₹${Number(row.bonus).toLocaleString('en-IN')}`,
      `₹${Number(row.deductions).toLocaleString('en-IN')}`,
      `₹${Number(row.net_paid).toLocaleString('en-IN')}`
    ];

    values.forEach((text, j) => {
      const color = j === 5 ? '#059669' : '#000000';
      doc.fillColor(color).font('NotoSans').fontSize(9)
        .text(text, colX[j] + 8, y + 8, { width: colWidths[j] - 16, align: j === 0 ? 'center' : 'left' });
    });

    y += rowHeight;
  }

  // Add enlarged chart
  if (fs.existsSync(chartPath) && fs.statSync(chartPath).size > 0) {
    addHeader();
    const chartY = 100;
    const chartX = (pageWidth - 500) / 2;
    doc.rect(chartX - 10, chartY - 10, 520, 240).fill('#FFFFFF').stroke('#E5E7EB', 1);
    doc.image(chartPath, chartX, chartY, { width: 500, height: 200 });
  }

  const pdfFilename = `payroll_report_${businessName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${pdfFilename}`);
  doc.pipe(res);
  doc.end();
}

// Enhanced export endpoint
router.get('/export', async (req, res) => {
  const { business_id, start_date, end_date, type } = req.query;
  
  if (!business_id || !start_date || !end_date || !['pdf', 'excel'].includes(type)) {
    return res.status(400).json({ error: 'Missing or invalid query parameters' });
  }

  try {
    const rows = await knex('salary_entries')
      .join('employees', 'salary_entries.employee_id', 'employees.id')
      .where('employees.business_id', business_id)
      .andWhereBetween('salary_entries.created_at', [start_date, end_date])
      .select(
        'employees.full_name',
        'salary_entries.base_salary',
        'salary_entries.bonus',
        'salary_entries.deductions',
        knex.raw(
          '(salary_entries.base_salary + salary_entries.bonus - salary_entries.deductions) as net_paid'
        )
      );

    const business = await knex('businesses').where({ id: business_id }).first();
    const businessName = business?.name || 'Business';

    const summary = rows.reduce(
      (acc, row) => {
        acc.total_base_salary += Number(row.base_salary);
        acc.total_bonus += Number(row.bonus);
        acc.total_deductions += Number(row.deductions);
        return acc;
      },
      { total_base_salary: 0, total_bonus: 0, total_deductions: 0 }
    );

    const chartPath = './payroll_analysis_chart.png';
    await generateProfessionalBarChart(summary, businessName, business_id, chartPath);

    if (type === 'pdf') {
      await generateOptimizedPayrollPDF(rows, businessName, business_id, start_date, end_date, summary, res);
    } else if (type === 'excel') {
      // Enhanced Excel export
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Payroll Report');

      // Professional Excel styling
      sheet.columns = [
        { header: 'Employee Name', key: 'full_name', width: 25 },
        { header: 'Base Salary (₹)', key: 'base_salary', width: 18 },
        { header: 'Bonus (₹)', key: 'bonus', width: 15 },
        { header: 'Deductions (₹)', key: 'deductions', width: 18 },
        { header: 'Net Paid (₹)', key: 'net_paid', width: 18 },
      ];

      // Header styling
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F46E5' }
      };
      sheet.getRow(1).height = 25;

      rows.forEach(row => sheet.addRow(row));

// Add empty row for spacing
sheet.addRow([]);

// Compute totals
const totalBase = rows.reduce((sum, r) => sum + Number(r.base_salary), 0);
const totalBonus = rows.reduce((sum, r) => sum + Number(r.bonus), 0);
const totalDeduction = rows.reduce((sum, r) => sum + Number(r.deductions), 0);
const totalNetPaid = rows.reduce((sum, r) => sum + Number(r.net_paid), 0);

// Append totals row
const totalRow = sheet.addRow({
  full_name: 'TOTAL',
  base_salary: totalBase,
  bonus: totalBonus,
  deductions: totalDeduction,
  net_paid: totalNetPaid
});

// Style the summary row
totalRow.font = { bold: true };
totalRow.eachCell((cell, colNumber) => {
  cell.border = {
    top: { style: 'thin' },
    bottom: { style: 'thin' }
  };
  if (colNumber > 1) {
    cell.numFmt = '"₹"#,##0';
  }
});


      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=payroll_report_${businessName.replace(/\s+/g, '_')}_${business_id}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    console.error('[EXPORT ERROR]', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

module.exports = router;
