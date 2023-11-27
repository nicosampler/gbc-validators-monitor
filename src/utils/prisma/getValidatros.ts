import { getPrisma } from "@/src/config/prisma";

const prisma = getPrisma();

export function getDBValidators(userId?: number) {
  return prisma.validator.findMany({
    where: userId
      ? {
          users: {
            some: {
              id: userId,
            },
          },
        }
      : undefined,
    include: {
      users: true,
    },
  });
}
