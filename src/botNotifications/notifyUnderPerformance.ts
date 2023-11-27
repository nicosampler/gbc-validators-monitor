import { bot } from "@/src/config";
import { inMemoryUsers } from "@/src/inMemoryDB";
import addMinutes from "date-fns/addMinutes";
import compareAsc from "date-fns/compareAsc";
import { InlineKeyboard } from "grammy";

export async function notifyUnderPerformance(
  userId: number,
  threshold: number
) {
  const user = inMemoryUsers[userId];
  const { last100AttestedPercentage, notified, chatId } = user;

  if (!last100AttestedPercentage || last100AttestedPercentage >= threshold) {
    return;
  }

  const notificationThreshold = addMinutes(
    notified?.underPerformance || new Date(0),
    30
  );
  if (compareAsc(new Date(), notificationThreshold) < 1) {
    return;
  }

  inMemoryUsers[user.id].notified = {
    ...(inMemoryUsers[user.id].notified || {}),
    underPerformance: new Date(),
  };

  const msg = `⚠️ Your validators performance has fallen below the threshold of ${threshold}%!`;

  const inlineKeyboard = new InlineKeyboard().text("OK", "remove_message");

  bot.api.sendMessage(chatId, msg, { reply_markup: inlineKeyboard });
}
