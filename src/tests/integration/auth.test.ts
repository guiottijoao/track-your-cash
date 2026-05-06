import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app/index";
import prisma from "../../lib/prisma";

beforeEach(async () => {
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
});

describe("POST /api/auth/register", () => {
  it("should register a user and return 201 with a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    expect(res.status).toBe(201);
    expect(typeof res.body).toBe("string");
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return 400 if name is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Jo",
      email: "john@example.com",
      password: "123456",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "not-an-email",
      password: "123456",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("should return 400 if password is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("should return 409 if email is already registered", async () => {
    await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
  });
});

describe("POST /api/auth/login", () => {
  it("should login and return 200 with a token", async () => {
    await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
      password: "123456",
    });

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe("string");
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return 401 if email does not exist", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "ghost@example.com",
      password: "123456",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if password is wrong", async () => {
    await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "123456",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("should return 400 if password is too short", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});
