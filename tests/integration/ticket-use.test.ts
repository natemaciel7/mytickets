import supertest from "supertest";
import app from "../../src/app";
import prisma from "../../src/database";
import { createTicket } from "../factories/ticketFactory";

const agent = supertest(app);

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE tickets RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE events RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PUT /tickets/use/:id", () => {
  it("should mark the ticket as used and return 204", async () => {
    const ticket = await createTicket();

    const response = await agent.put(`/tickets/use/${ticket.id}`);
    expect(response.status).toBe(204);

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(updatedTicket?.used).toBe(true);
  });

  it("should return 404 if ticket does not exist", async () => {
    const response = await agent.put("/tickets/use/99999");
    expect(response.status).toBe(404);
  });
});
