import supertest from "supertest";
import app from "../../src/index";
import prisma from "../../src/database";
import { faker } from "@faker-js/faker";

const agent = supertest(app);

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE events RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /events", () => {
  it("should create a new event and return status 201", async () => {
    const event = {
      name: faker.company.name(),
      date: faker.date.future().toISOString(),
    };

    const response = await agent.post("/events").send(event);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(event.name);
  });

  it("should return 422 if body is invalid", async () => {
    const response = await agent.post("/events").send({});
    expect(response.status).toBe(422);
  });
});
