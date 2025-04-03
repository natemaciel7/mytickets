import { faker } from "@faker-js/faker";
import prisma from "../../src/database";

export async function createEvent() {
  return prisma.event.create({
    data: {
      name: faker.company.name(),
      date: faker.date.future(),
    },
  });
}
