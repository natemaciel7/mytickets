import supertest from "supertest";
import app from "../src/app";
import prisma from "../src/database";
import { cleanDb } from "./helpers";
import { createEvent } from "../factories/eventFactory";

const server = supertest(app);

beforeEach(async () => {
  await cleanDb();
});

async function ensureEventPersisted(event: any) {
  let confirmed = null;
  let retries = 0;
  while (!confirmed && retries < 5) {
    confirmed = await prisma.event.findUnique({ where: { id: event.id } });
    if (!confirmed) await new Promise((r) => setTimeout(r, 50));
    retries++;
  }
  return confirmed;
}

describe("POST /tickets", () => {
  it("deve criar um ticket e retornar status 201", async () => {
    const event = await createEvent();
    await ensureEventPersisted(event);

    const body = {
      owner: "Natália Teste",
      code: "ABC1234567",
      eventId: event.id,
    };

    const response = await server.post("/tickets").send(body);
    console.log("Resposta criação:", response.body);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        owner: body.owner,
        code: body.code,
        eventId: body.eventId,
        used: false,
      })
    );
  });

  it("deve retornar 404 se o evento não existir", async () => {
    const response = await server.post("/tickets").send({
      owner: "Sem Evento",
      code: "ZXC9876543",
      eventId: 99999,
    });
    expect(response.status).toBe(404);
  });

  it("deve retornar 409 se o código do ticket já existir para o evento", async () => {
    const event = await createEvent();
    await ensureEventPersisted(event);

    const code = "DUPLICADO123";
    await prisma.ticket.create({
      data: { owner: "Repetido", code, eventId: event.id },
    });

    const response = await server.post("/tickets").send({
      owner: "Outro Dono",
      code,
      eventId: event.id,
    });

    console.log("Resposta duplicado:", response.body);
    expect(response.status).toBe(409);
  });
});

describe("GET /tickets/:eventId", () => {
  it("deve retornar 200 e uma lista de tickets para o evento", async () => {
    const event = await createEvent();
    await ensureEventPersisted(event);

    const ticket1 = await prisma.ticket.create({
      data: { owner: "Ticket 1", code: "UNICO1", eventId: event.id },
    });

    const ticket2 = await prisma.ticket.create({
      data: { owner: "Ticket 2", code: "UNICO2", eventId: event.id },
    });

    const response = await server.get(`/tickets/${event.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ticket1.id }),
        expect.objectContaining({ id: ticket2.id }),
      ])
    );
  });

  it("deve retornar 200 e lista vazia se o evento não existir", async () => {
    const response = await server.get("/tickets/99999");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("PUT /tickets/use/:id", () => {
  it("deve marcar um ticket como usado e retornar 204", async () => {
    const event = await createEvent();
    await ensureEventPersisted(event);

    const ticket = await prisma.ticket.create({
      data: {
        owner: "Usar Agora",
        code: "PARAUSO123",
        eventId: event.id,
      },
    });

    console.log("Ticket criado para uso:", ticket);

    const response = await server.put(`/tickets/use/${ticket.id}`);
    console.log("Resposta uso:", response.body);

    expect(response.status).toBe(204);

    const updated = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(updated?.used).toBe(true);
  });

  it("deve retornar 404 se o ticket não existir", async () => {
    const response = await server.put("/tickets/use/99999");
    expect(response.status).toBe(404);
  });
});
