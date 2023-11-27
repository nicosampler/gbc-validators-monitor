import { getPrisma } from "@/src/config/prisma";

const prisma = getPrisma();

export function getUsers() {
  return prisma.user.findMany();
}
