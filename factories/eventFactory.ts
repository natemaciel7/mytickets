import { faker } from "@faker-js/faker";
import prisma from "../src/database";

export async function createEvent() {
  return prisma.event.create({
    data: {
      name: faker.lorem.words(3),
      date: faker.date.future(),
    },
  });
}
