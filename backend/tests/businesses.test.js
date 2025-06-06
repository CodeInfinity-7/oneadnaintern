const request = require('supertest');
const app = require('../src/app');
const path = require('path');
const knexConfig = require(path.resolve(__dirname, '../knexfile.js'));

const knex = require('knex')(knexConfig.development);

let businessId;

const testBusiness = {
  name: '__TEST CORP__',
  owner: 'Moulya',
  email: 'testcorp@example.com',
  phone: '1234567890',
  address: 'Test Street, CA',
};

beforeAll(async () => {
  await knex('businesses').where('name', testBusiness.name).del();
});

afterAll(async () => {
  await knex('businesses').where('name', testBusiness.name).del();
  await knex.destroy();
});

describe('Businesses API', () => {
  test('POST /businesses should create a new business', async () => {
    const res = await request(app)
      .post('/businesses')
      .set('x-skip-auth', 'true')
      .send(testBusiness);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    businessId = res.body.id;
  });

  test('GET /businesses/:id should fetch the created business', async () => {
    const res = await request(app)
      .get(`/businesses/${businessId}`)
      .set('x-skip-auth', 'true');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(testBusiness.name);
  });

  test('PUT /businesses/:id should update the business', async () => {
    const res = await request(app)
      .put(`/businesses/${businessId}`)
      .set('x-skip-auth', 'true')
      .send({ ...testBusiness, name: 'Updated Corp' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Corp');
  });

  test('GET /businesses with pagination and search', async () => {
    const res = await request(app)
      .get('/businesses?page=1&limit=5&search=corp')
      .set('x-skip-auth', 'true');

    console.log('Pagination response:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(
      res.body.data.some((b) => b.name.toLowerCase().includes('corp'))
    ).toBeTruthy();
  });

  test('DELETE /businesses/:id should delete the business', async () => {
    const res = await request(app)
      .delete(`/businesses/${businessId}`)
      .set('x-skip-auth', 'true');
    expect([200, 204]).toContain(res.statusCode);
  });
});
