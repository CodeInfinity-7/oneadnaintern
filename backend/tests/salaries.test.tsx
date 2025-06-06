const request = require('supertest');
const app = require('../src/app'); // Your Express app
const path = require('path');
const knexConfig = require(path.resolve(__dirname, '../knexfile.js'));
const knex = require('knex')(knexConfig.development);

let testEmployeeId;
let testBusinessId;
let insertedSalaryId;

beforeAll(async () => {
  // Create test business
  const bizRes = await request(app).post('/businesses').send({
    name: `Test Salary Biz ${Date.now()}`,
    owner: 'Test Owner',
    email: `biz${Date.now()}@test.com`,
    phone: '9999999999',
    address: 'Salary Lane'
  });

  testBusinessId = bizRes.body.id;

  // Create test employee
  const empRes = await request(app).post('/employees').send({
    full_name: 'Salary Test Emp',
    designation: 'Tester',
    mobile: '9876543210',
    email: `emp${Date.now()}@test.com`,
    business_id: testBusinessId
  });

  testEmployeeId = empRes.body.id;
});

afterAll(async () => {
  if (insertedSalaryId) {
    await knex('salary_entries').where('id', insertedSalaryId).del();
  }
  await knex('employees').where('id', testEmployeeId).del();
  await knex('businesses').where('id', testBusinessId).del();
  await knex.destroy();
});

describe('Salary Endpoints Integration Tests', () => {
  it('POST /salaries/calculate → returns total_amount', async () => {
    const res = await request(app)
      .post('/salaries/calculate')
      .set('x-skip-auth', 'true')
      .send({
        base_salary: 50000,
        bonus: 5000,
        deductions: 2000
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.total_amount).toBe(53000);
  });

  it('POST /salaries → saves salary entry to DB', async () => {
    const res = await request(app)
      .post('/salaries')
      .set('x-skip-auth', 'true')
      .send({
        employee_id: testEmployeeId,
        base_salary: 45000,
        bonus: 5000,
        deductions: 1000
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.total_amount).toBe(49000);

    insertedSalaryId = res.body.id;
  });

  it('GET /salaries?employee_id=... → returns salary list', async () => {
    const res = await request(app)
      .get(`/salaries?employee_id=${testEmployeeId}`)
      .set('x-skip-auth', 'true');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('total_amount');
    expect(res.body[0].employee_id).toBe(testEmployeeId);
  });

  it('GET /salaries → 400 if employee_id missing', async () => {
    const res = await request(app)
      .get('/salaries')
      .set('x-skip-auth', 'true');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /salaries → 400 if required fields missing', async () => {
    const res = await request(app)
      .post('/salaries')
      .set('x-skip-auth', 'true')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
