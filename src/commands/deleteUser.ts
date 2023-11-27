import { bot } from "@/src/config";
import { deleteUser as _deleteUser } from "@/src/utils/prisma/deleteUser";
import { CommandContext, Context } from "grammy";
import { getUserIdFromCtx } from "../utils/telegram/getUserIdFromCtx";
import { inMemoryUsers } from "@/src/inMemoryDB";

export async function deleteUser(ctx: CommandContext<Context>) {
  try {
    // recover userId
    const userId = await getUserIdFromCtx(ctx);
    if (!userId) return false;

    // delete user from db
    await _deleteUser(userId);
    // delete user from inMemoryDB
    delete inMemoryUsers[userId];

    // notify user
    await bot.api.sendMessage(
      ctx.chat.id,
      "😢 User deleted! We'll miss you! Hope to see you again soon! 👋"
    );
  } catch (error) {
    console.error(error);
    await bot.api.sendMessage(
      ctx.chat.id,
      "😢 Something went wrong, please try again later!"
    );
  }
}
