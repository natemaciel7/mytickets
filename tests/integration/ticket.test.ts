import supertest from "supertest";
import app from "../../src/app";
import prisma from "../../src/database";
import { createEvent } from "../factories/evenFactory";
import { faker } from "@faker-js/faker";

const agent = supertest(app);

beforeAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE tickets RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE events RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /tickets", () => {
  it("should create a new ticket and return 201", async () => {
    const event = await createEvent();
    const checkEvent = await prisma.event.findUnique({
      where: { id: event.id },
    });
    expect(checkEvent).not.toBeNull();

    const ticket = {
      code: faker.string.uuid(),
      owner: faker.person.fullName(),
      eventId: event.id,
    };

    const response = await agent.post("/tickets").send(ticket);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.owner).toBe(ticket.owner);
  });

  it("should return 422 for invalid body", async () => {
    const response = await agent.post("/tickets").send({});
    expect(response.status).toBe(422);
  });
});
