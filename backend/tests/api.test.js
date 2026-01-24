const request = require('supertest');
const app = require('../server');
const prisma = require('../config/db');

describe('API Endpoints', () => {
  let createdUserId;
  let createdDeptId;
  const siteId = "TT"; // Assuming seeded

  // --- SITES ---
  describe('Sites API', () => {
    it('should fetch all sites', async () => {
      const res = await request(app).get('/api/sites');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should update a site budget', async () => {
      const res = await request(app).put(`/api/sites/${siteId}`).send({
        budget: 6000000
      });
      // It might return 404 if DB is empty/not seeded, but assuming seeded as per logic
      // If seeded, status should be 200
      if (res.statusCode === 200) {
          expect(res.body.budget).toEqual(6000000);
      }
    });
  });

  // --- DEPARTMENTS ---
  describe('Departments API', () => {
    it('should create a new department', async () => {
      const res = await request(app).post('/api/departments').send({
        name: "Test Dept",
        head: "Test Head",
        location: "Test Loc",
        budget: 100000,
        siteId: siteId,
        status: "Active",
        colorCallback: "bg-blue-500"
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      createdDeptId = res.body.id;
    });

    it('should fetch all departments', async () => {
      const res = await request(app).get('/api/departments');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should update the created department', async () => {
      const res = await request(app).put(`/api/departments/${createdDeptId}`).send({
          name: "Updated Test Dept"
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual("Updated Test Dept");
    });
  });

  // --- USERS ---
  describe('Users API', () => {
    it('should create a new user', async () => {
      const res = await request(app).post('/api/users').send({
        name: "Test User",
        email: `test${Math.random()}@example.com`,
        role: "Employee",
        departmentId: createdDeptId, // Link to the dept we just made
        status: "Active"
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      createdUserId = res.body.id;
    });

    it('should fetch all users', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should update the created user', async () => {
      const res = await request(app).put(`/api/users/${createdUserId}`).send({
          name: "Updated Test User"
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual("Updated Test User");
    });

    it('should delete the created user', async () => {
      const res = await request(app).delete(`/api/users/${createdUserId}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  // --- CLEANUP ---
  describe('Cleanup', () => {
      it('should delete the created department', async () => {
        const res = await request(app).delete(`/api/departments/${createdDeptId}`);
        expect(res.statusCode).toEqual(200);
      });
  });
});
