import { bot } from "@/src/config";
import { CommandContext, Context } from "grammy";
import { getUserIdFromCtx } from "../utils/telegram/getUserIdFromCtx";
import { inMemoryUsers, isUserReady } from "@/src/inMemoryDB";
import { updateUsersStatsImp } from "@/src/scheduler/tasks/updateUsersStats";

export async function stats(ctx: CommandContext<Context>) {
  try {
    // recover userId
    const userId = await getUserIdFromCtx(ctx);
    if (!userId) return;

    const user = inMemoryUsers[userId];
    if (!isUserReady(userId)) {
      await bot.api.sendMessage(
        user.chatId,
        "Stats are not available yet. We will automatically send them to you as soon as they are ready."
      );
      return;
    }

    user.messageId = undefined;

    await updateUsersStatsImp(userId);
  } catch (error) {
    console.error(error);
    await bot.api.sendMessage(
      ctx.chat.id,
      "😢 Something went wrong, please try again later!"
    );
  }
}
