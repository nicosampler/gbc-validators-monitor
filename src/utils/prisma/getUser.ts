import { getPrisma } from "@/src/config/prisma";

const prisma = getPrisma();

export function getUser(userId: number) {
  return prisma.user.findUniqueOrThrow({ where: { id: userId } });
}
