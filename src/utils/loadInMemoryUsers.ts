import { inMemoryUsers } from "@/src/inMemoryDB";
import { getPrisma } from "@/src/config/prisma";

const prisma = getPrisma();

export async function loadInMemoryUsers() {
  const users = await prisma.user.findMany();

  users.forEach((user) => {
    inMemoryUsers[user.id] = {
      id: user.id,
      chatId: user.chatId,
      messageId: user.messageId || undefined,
    };
  });
}
