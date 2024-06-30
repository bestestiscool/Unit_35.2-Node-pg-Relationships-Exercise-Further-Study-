process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
  await db.query(`INSERT INTO companies (code, name, description) VALUES ('testco', 'Test Company', 'Test description')`);
  await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('testco', 100)`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", () => {
  test("It should respond with an array of invoices", async () => {
    const response = await request(app).get("/invoices");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      invoices: [{ id: expect.any(Number), comp_code: "testco" }]
    });
  });
});

describe("GET /invoices/:id", () => {
  test("It should respond with details of a specific invoice", async () => {
    const response = await request(app).get("/invoices/1");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      invoice: {
        id: 1,
        amt: 100,
        paid: false,
        add_date: expect.any(String),
        paid_date: null,
        company: {
          code: "testco",
          name: "Test Company",
          description: "Test description"
        }
      }
    });
  });

  test("It should respond with 404 for a non-existing invoice", async () => {
    const response = await request(app).get("/invoices/999");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /invoices", () => {
  test("It should create a new invoice", async () => {
    const newInvoice = { comp_code: "testco", amt: 200 };
    const response = await request(app).post("/invoices").send(newInvoice);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: "testco",
        amt: 200,
        paid: false,
        add_date: expect.any(String),
        paid_date: null
      }
    });
  });
});

describe("PUT /invoices/:id", () => {
  test("It should update an existing invoice", async () => {
    const updatedInvoice = { amt: 300 };
    const response = await request(app).put("/invoices/1").send(updatedInvoice);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "testco",
        amt: 300,
        paid: false,
        add_date: expect.any(String),
        paid_date: null
      }
    });
  });

  test("It should respond with 404 for a non-existing invoice", async () => {
    const response = await request(app).put("/invoices/999").send({ amt: 400 });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /invoices/:id", () => {
  test("It should delete an existing invoice", async () => {
    const response = await request(app).delete("/invoices/1");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("It should respond with 404 for a non-existing invoice", async () => {
    const response = await request(app).delete("/invoices/999");
    expect(response.statusCode).toBe(404);
  });
});
