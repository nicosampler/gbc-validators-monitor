import { getPrisma } from "@/src/config/prisma";

const prisma = getPrisma();

export function updateUserMessageId(userId: number, messageId: number) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      messageId: messageId,
    },
  });
}
