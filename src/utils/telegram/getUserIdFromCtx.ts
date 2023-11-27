import { CommandContext, Context } from "grammy";

export async function getUserIdFromCtx(ctx: CommandContext<Context>) {
  const userId = ctx.message?.from.id;
  if (!userId) {
    await ctx.reply(`😵 - User id not found - 😵`);
    return;
  }
  return userId;
}
