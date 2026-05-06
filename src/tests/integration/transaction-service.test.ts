import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app/index";
import prisma from "../../lib/prisma";

const testUser = {
  name: "John Doe",
  email: "john@example.com",
  password: "123456",
};

const testAccount = {
  external_id: "ext-001",
  name: "My Checking",
  type: "BANK",
  subtype: "CHECKING_ACCOUNT",
  number: "0001",
  currency_code: "USD",
  balance: 1000,
  connector_name: "My Bank",
  connector_image_url: "https://example.com/bank.png",
};

const testTransaction = {
  external_id: "txn-001",
  description: "Grocery Store",
  amount: -50.75,
  currency_code: "USD",
  date: "2026-01-15T10:00:00.000Z",
  type: "DEBIT",
  status: "POSTED",
  category: "Food",
  original_category: "Groceries",
  installment_number: 1,
  installment_total: 1,
};

let token: string;
let accountId: number;

beforeEach(async () => {
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post("/api/auth/register").send(testUser);
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: testUser.email, password: testUser.password });
  token = loginRes.body;

  const accountRes = await request(app)
    .post("/api/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send(testAccount);
  accountId = accountRes.body.id;
});

describe("POST /api/transactions", () => {
  it("should create a transaction and return 201", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      external_id: "txn-001",
      description: "Grocery Store",
      amount: -50.75,
      currency_code: "USD",
      type: "DEBIT",
      status: "POSTED",
      category: "Food",
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({ ...testTransaction, accountId });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 409 if transaction with same external_id already exists", async () => {
    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 404 if accountId does not exist", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId: 99999 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });
});

describe("GET /api/transactions", () => {
  it("should return empty array when no transactions", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return all transactions", async () => {
    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, external_id: "txn-002", accountId });

    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/api/transactions");

    expect(res.status).toBe(401);
  });
});

describe("GET /api/transactions/:id", () => {
  it("should return transaction by id", async () => {
    const created = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    const res = await request(app)
      .get(`/api/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      external_id: "txn-001",
      description: "Grocery Store",
    });
  });

  it("should return 404 if transaction not found", async () => {
    const res = await request(app)
      .get("/api/transactions/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/api/transactions/1");

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/transactions/:id", () => {
  it("should update transaction and return 200", async () => {
    const created = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    const res = await request(app)
      .put(`/api/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Updated Store", amount: -100 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      description: "Updated Store",
      amount: -100,
    });
  });

  it("should return 404 if transaction not found", async () => {
    const res = await request(app)
      .put("/api/transactions/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 404 if updating to a non-existent accountId", async () => {
    const created = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    const res = await request(app)
      .put(`/api/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ accountId: 99999 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 409 if updating external_id to one that already exists", async () => {
    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    const second = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, external_id: "txn-002", accountId });

    const res = await request(app)
      .put(`/api/transactions/${second.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ external_id: "txn-001" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .put("/api/transactions/1")
      .send({ description: "X" });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/transactions/:id", () => {
  it("should delete transaction and return 204", async () => {
    const created = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testTransaction, accountId });

    const res = await request(app)
      .delete(`/api/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("should return 404 if transaction not found", async () => {
    const res = await request(app)
      .delete("/api/transactions/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).delete("/api/transactions/1");

    expect(res.status).toBe(401);
  });
});
