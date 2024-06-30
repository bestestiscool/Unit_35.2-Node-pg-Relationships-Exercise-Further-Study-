process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
  await db.query(`INSERT INTO companies (code, name, description) VALUES ('testco', 'Test Company', 'Test description')`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("It should respond with an array of companies", async () => {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ code: "testco", name: "Test Company" }]
    });
  });
});

describe("GET /companies/:code", () => {
  test("It should respond with details of a specific company", async () => {
    const response = await request(app).get("/companies/testco");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        code: "testco",
        name: "Test Company",
        description: "Test description",
        invoices: []
      }
    });
  });

  test("It should respond with 404 for a non-existing company", async () => {
    const response = await request(app).get("/companies/nonexist");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("It should create a new company", async () => {
    const newCompany = { name: "New Company", description: "New description" };
    const response = await request(app).post("/companies").send(newCompany);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      company: {
        code: "new-company",
        name: "New Company",
        description: "New description"
      }
    });
  });
});

describe("PUT /companies/:code", () => {
  test("It should update an existing company", async () => {
    const updatedCompany = { name: "Updated Company", description: "Updated description" };
    const response = await request(app).put("/companies/testco").send(updatedCompany);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        code: "testco",
        name: "Updated Company",
        description: "Updated description"
      }
    });
  });

  test("It should respond with 404 for a non-existing company", async () => {
    const response = await request(app).put("/companies/nonexist").send({ name: "Nonexist", description: "Nonexist" });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("It should delete an existing company", async () => {
    const response = await request(app).delete("/companies/testco");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("It should respond with 404 for a non-existing company", async () => {
    const response = await request(app).delete("/companies/nonexist");
    expect(response.statusCode).toBe(404);
  });
});
