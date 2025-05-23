const request = require('supertest');
const app = require('../src/app');  // import app, not index

describe('GET /businesses', () => {
  it('should return status 200 and an array', async () => {
    const res = await request(app).get('/businesses');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /businesses', () => {
  it('should create a new business and return it', async () => {
    const newBusiness = {
      name: 'Test Shop',
      owner: 'Test Owner',
      email: 'test@example.com',
      phone: '1234567890',
      address: '123 Test St'
    };

    const res = await request(app)
      .post('/businesses')
      .send(newBusiness);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(newBusiness.name);
    expect(res.body.owner).toBe(newBusiness.owner);
  });
});
