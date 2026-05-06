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

let token: string;

beforeEach(async () => {
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await request(app).post("/api/auth/register").send(testUser);
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: testUser.email, password: testUser.password });
  token = res.body;
});

describe("POST /api/accounts", () => {
  it("should create an account and return 201", async () => {
    const res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(testAccount);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ external_id: "ext-001", name: "My Checking", type: "BANK" });
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).post("/api/accounts").send(testAccount);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 409 if account with same external_id already exists", async () => {
    await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(testAccount);

    const res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(testAccount);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
  });
});

describe("GET /api/accounts", () => {
  it("should return empty array when no accounts", async () => {
    const res = await request(app)
      .get("/api/accounts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return all accounts", async () => {
    await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(testAccount);

    await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testAccount, external_id: "ext-002", number: "0002" });

    const res = await request(app)
      .get("/api/accounts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/api/accounts");

    expect(res.status).toBe(401);
  });
});

describe("GET /api/accounts/:id", () => {
  it("should return account by id", async () => {
    const created = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(testAccount);

    const res = await request(app)
      .get(`/api/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ external_id: "ext-001", name: "My Checking" });
  });

  it("should return 404 if account not found", async () => {
    const res = await request(app)
      .get("/api/accounts/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/api/accounts/1");

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/accounts/:id", () => {
  it("should update account and return 200", async () => {
    const created = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(testAccount);

    const res = await request(app)
      .put(`/api/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Account", balance: 2000 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: "Updated Account", balance: 2000 });
  });

  it("should return 404 if account not found", async () => {
    const res = await request(app)
      .put("/api/accounts/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 400 if invalid data is sent", async () => {
    const created = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(testAccount);

    const res = await request(app)
      .put(`/api/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ currency_code: "TOOLONG" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).put("/api/accounts/1").send({ name: "X" });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/accounts/:id", () => {
  it("should delete account and return 204", async () => {
    const created = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(testAccount);

    const res = await request(app)
      .delete(`/api/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("should return 404 if account not found", async () => {
    const res = await request(app)
      .delete("/api/accounts/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).delete("/api/accounts/1");

    expect(res.status).toBe(401);
  });
});
