import prisma from "../src/database";
import { faker } from "@faker-js/faker";
import { createEvent } from "./eventFactory";

export async function createTicket(eventId?: number) {
  const event = eventId ? { id: eventId } : await createEvent();

  return prisma.ticket.create({
    data: {
      owner: faker.person.fullName(),
      code: faker.string.alphanumeric(10),
      eventId: event.id,
    },
  });
}
