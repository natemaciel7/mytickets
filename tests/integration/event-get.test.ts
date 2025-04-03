import supertest from "supertest";
import app from "../../src/app";
import prisma from "../../src/database";
import { createEvent } from "../factories/evenFactory";

const agent = supertest(app);

beforeAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE events RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /events/:id", () => {
  it("should return a specific event with status 200", async () => {
    const event = await createEvent();
    const checkEvent = await prisma.event.findUnique({
      where: { id: event.id },
    });
    expect(checkEvent).not.toBeNull();

    const response = await agent.get(`/events/${event.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: event.id,
      name: event.name,
    });
  });

  it("should return 404 if event does not exist", async () => {
    const response = await agent.get("/events/99999");
    expect(response.status).toBe(404);
  });
});
