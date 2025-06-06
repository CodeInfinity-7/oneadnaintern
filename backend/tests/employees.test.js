const request = require('supertest');
const app = require('../src/app');
const path = require('path');
const knexConfig = require(path.resolve(__dirname, '../knexfile.js'));

const knex = require('knex')(knexConfig.development);

let testBusinessId, employeeId;
let testEmployee;

describe('Employees API', () => {
  beforeAll(async () => {
    const uniqueName = `Test Co ${Date.now()}`;
    const businessRes = await request(app)
      .post('/businesses')
      .set('x-skip-auth', 'true')
      .send({
        name: uniqueName,
        owner: 'test-owner',
        email: 'test@oneadna.com',
        phone: '1234567890',
        address: 'Somewhere',
      });

    console.log('businessRes.status:', businessRes.status);
    console.log('businessRes.body:', businessRes.body);

    if (!businessRes.body.id) {
      throw new Error('❌ Failed to create test business');
    }

    testBusinessId = businessRes.body.id;

    testEmployee = {
      full_name: 'Test Emp',
      designation: 'Tester',
      mobile: '1234567890',
      email: `test${Date.now()}@alpha.com`,
      business_id: testBusinessId,
    };
  });

  test('POST /employees', async () => {
    const res = await request(app)
      .post('/employees')
      .set('x-skip-auth', 'true')
      .send(testEmployee);
    console.log('POST response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    employeeId = res.body.id;
  });

  test('GET /employees?business_id={id} should return employees list', async () => {
    const res = await request(app)
      .get(`/employees?business_id=${testBusinessId}`)
      .set('x-skip-auth', 'true');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.employees)).toBe(true);
    expect(res.body.employees.some((e) => e.full_name === testEmployee.full_name)).toBeTruthy();
    console.log('✅ Successfully tested GET /employees?business_id={id}');
  });

  test('PUT /employees/:id should update the employee', async () => {
    await request(app)
      .put(`/employees/${employeeId}`)
      .set('x-skip-auth', 'true')
      .send({
        full_name: 'Updated Emp',
        designation: 'Tester',
        mobile: '1234567890',
        email: 'updated@alpha.com',
        business_id: testBusinessId,
      })
      .expect(200);

    const updatedRes = await request(app)
      .get(`/employees?business_id=${testBusinessId}`)
      .set('x-skip-auth', 'true');
    const updatedEmployee = updatedRes.body.employees.find((e) => e.id === employeeId);
    expect(updatedEmployee.full_name).toBe('Updated Emp');
    console.log('✅ Successfully tested PUT /employees/:id');
  });

  test('DELETE /employees/:id should delete the employee', async () => {
    await request(app)
      .delete(`/employees/${employeeId}`)
      .set('x-skip-auth', 'true')
      .expect(200);

    const confirm = await request(app)
      .get(`/employees?business_id=${testBusinessId}`)
      .set('x-skip-auth', 'true');
    const deleted = confirm.body.employees.find((e) => e.id === employeeId);
    expect(deleted).toBeUndefined();
    console.log('✅ Successfully tested DELETE /employees/:id');
  });

  test('GET /employees supports pagination with page and limit', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/employees')
        .set('x-skip-auth', 'true')
        .send({
          ...testEmployee,
          email: `user${i}@alpha.com`,
          mobile: `999000${i}`,
        });
    }

    const res = await request(app)
      .get(`/employees?business_id=${testBusinessId}&page=1&limit=2`)
      .set('x-skip-auth', 'true');
    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBeLessThanOrEqual(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.total).toBeGreaterThanOrEqual(5);
    console.log('✅ Pagination flow is successful');
  });

  test('GET /employees supports combined pagination and search', async () => {
    const res = await request(app)
      .get(`/employees?business_id=${testBusinessId}&search=Emp&page=2&limit=1`)
      .set('x-skip-auth', 'true');
    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBeLessThanOrEqual(1);
    expect(res.body.page).toBe(2);
    console.log('✅ Combined pagination and search flow is successful');
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
