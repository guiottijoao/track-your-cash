import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app/index";
import prisma from "../../lib/prisma";

let token: string;

beforeEach(async () => {
  await prisma.user.deleteMany();
  await request(app).post("/api/auth/register").send({
    name: "Admin",
    email: "admin@example.com",
    password: "123456",
  });
  const res = await request(app).post("/api/auth/login").send({
    email: "admin@example.com",
    password: "123456",
  });
  token = res.body;
});

describe("POST /api/users", () => {
  it("should create a user and return 201", async () => {
    
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "John Doe",
        email: "john@example.com",
        password: "123456",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "John Doe", email: "john@example.com" });
    expect(res.body.password).toBeUndefined();
  });

  it("should return 400 if required fields not filled", async () => {
    
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "", email: "john@example.com", password: "123456" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("should return 409 if email is duplicated", async () => {
    
    await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "John", email: "john@email.com", password: "123456" });

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Maria", email: "john@email.com", password: "123456" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "John", email: "john@example.com", password: "123456" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/users", () => {
  it("should return only the admin when no other users exist", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ email: "admin@example.com" });
  });

  it("should return all users", async () => {
    
    await request(app).post("/api/users").set("Authorization", `Bearer ${token}`).send({ name: "John", email: "john@example.com", password: "123456" });
    await request(app).post("/api/users").set("Authorization", `Bearer ${token}`).send({ name: "Maria", email: "maria@example.com", password: "123456" });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/users/:id", () => {
  it("should return user by id", async () => {
    
    const created = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "John", email: "john@example.com", password: "123456" });

    const res = await request(app)
      .get(`/api/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: "John", email: "john@example.com" });
  });

  it("should return 404 if user not found", async () => {
    
    const res = await request(app)
      .get("/api/users/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/api/users/1");
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/users/:id", () => {
  it("should update user and return 200", async () => {
    
    const created = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "John", email: "john@example.com", password: "123456" });

    const res = await request(app)
      .put(`/api/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "John Updated" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: "John Updated" });
  });

  it("should return 404 if user not found", async () => {
    
    const res = await request(app)
      .put("/api/users/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 409 if email already in use", async () => {
    
    await request(app).post("/api/users").set("Authorization", `Bearer ${token}`).send({ name: "John", email: "john@example.com", password: "123456" });
    const second = await request(app).post("/api/users").set("Authorization", `Bearer ${token}`).send({ name: "Maria", email: "maria@example.com", password: "123456" });

    const res = await request(app)
      .put(`/api/users/${second.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "john@example.com" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).put("/api/users/1").send({ name: "X" });
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete user and return 204", async () => {
    
    const created = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "John", email: "john@example.com", password: "123456" });

    const res = await request(app)
      .delete(`/api/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("should return 404 if user not found", async () => {
    
    const res = await request(app)
      .delete("/api/users/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).delete("/api/users/1");
    expect(res.status).toBe(401);
  });
});
