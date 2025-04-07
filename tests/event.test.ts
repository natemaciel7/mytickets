import supertest from "supertest";
import app from "../src/app";
import { cleanDb } from "./helpers";
import { faker } from "@faker-js/faker";
import prisma from "../src/database";
import { createEvent } from "../factories/eventFactory";

const server = supertest(app);

beforeEach(async () => {
  await cleanDb();
});

describe("GET /events", () => {
  it("deve retornar 200 e uma lista de eventos", async () => {
    const event = await createEvent();

    const response = await server.get("/events");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: event.id,
          name: event.name,
          date: expect.any(String),
        }),
      ])
    );
  });
});

describe("GET /events/:id", () => {
  it("deve retornar 200 e um evento válido", async () => {
    const event = await createEvent();

    const response = await server.get(`/events/${event.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: event.id,
        name: event.name,
        date: expect.any(String),
      })
    );
  });

  it("deve retornar 404 se o evento não existir", async () => {
    const response = await server.get("/events/99999");
    expect(response.status).toBe(404);
  });
});

describe("POST /events", () => {
  it("deve retornar 201 e criar um evento válido", async () => {
    const body = {
      name: faker.lorem.words(3),
      date: faker.date.future().toISOString(),
    };

    const response = await server.post("/events").send(body);
    console.log("Evento criado:", response.body);

    let confirmed = null;
    let retry = 0;
    while (!confirmed && retry < 5) {
      confirmed = await prisma.event.findUnique({
        where: { id: response.body.id },
      });
      if (!confirmed) await new Promise((r) => setTimeout(r, 50));
      retry++;
    }

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: body.name,
        date: expect.any(String),
      })
    );

    const eventInDb = await prisma.event.findUnique({
      where: { name: body.name },
    });

    expect(eventInDb).not.toBeNull();
  });

  it("deve retornar 422 se os dados forem inválidos", async () => {
    const response = await server.post("/events").send({
      nome: "sem_validação",
    });

    expect(response.status).toBe(422);
  });
});

describe("PUT /events/:id", () => {
  it("deve atualizar um evento existente", async () => {
    const event = await createEvent();
    console.log("Evento para update:", event);

    const newData = {
      name: "Evento Atualizado",
      date: faker.date.future().toISOString(),
    };

    const response = await server.put(`/events/${event.id}`).send(newData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: event.id,
        name: newData.name,
        date: expect.any(String),
      })
    );
  });

  it("deve retornar 404 se o evento não existir", async () => {
    const response = await server.put("/events/99999").send({
      name: "Inexistente",
      date: faker.date.future().toISOString(),
    });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /events/:id", () => {
  it("deve deletar um evento existente e retornar 200 ou 204", async () => {
    const event = await createEvent();

    const response = await server.delete(`/events/${event.id}`);

    expect([200, 204]).toContain(response.status);

    const eventInDb = await prisma.event.findUnique({
      where: { id: event.id },
    });

    expect(eventInDb).toBeNull();
  });

  it("deve retornar 404 se o evento não existir", async () => {
    const response = await server.delete("/events/99999");
    expect(response.status).toBe(404);
  });
});
