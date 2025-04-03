import { faker } from "@faker-js/faker";
import prisma from "../../src/database";
import { createEvent } from "./evenFactory";

export async function createTicket() {
  const event = await createEvent();

  return prisma.ticket.create({
    data: {
      code: faker.string.uuid(),
      owner: faker.person.fullName(),
      eventId: event.id,
    },
  });
}
