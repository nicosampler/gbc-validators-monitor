import { bot } from "@/src/config";
import { deleteUser as _deleteUser } from "@/src/utils/prisma/deleteUser";
import { CommandContext, Context } from "grammy";
import { getUserIdFromCtx } from "../utils/telegram/getUserIdFromCtx";
import { getDBWithdrawalAddresses } from "@/src/utils/prisma/getWithdrawalAddresses";

export async function myWithdrawalAddresses(ctx: CommandContext<Context>) {
  try {
    // recover userId
    const userId = await getUserIdFromCtx(ctx);
    if (!userId) return false;

    const wa = await getDBWithdrawalAddresses(userId);

    // notify user
    await bot.api.sendMessage(
      ctx.chat.id,
      `Your withdrawal addresses are:

${wa.map((w) => w.address).join("\n")}
      `
    );
  } catch (error) {
    console.error(error);
    await bot.api.sendMessage(
      ctx.chat.id,
      "😢 Something went wrong, please try again later!"
    );
  }
}
