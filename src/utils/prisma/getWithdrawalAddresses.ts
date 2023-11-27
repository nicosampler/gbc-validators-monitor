import { getPrisma } from "@/src/config/prisma";

const prisma = getPrisma();

export function getDBWithdrawalAddresses(userId?: number) {
  return prisma.withdrawalAddress.findMany({
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
