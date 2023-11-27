import { InlineKeyboard } from "grammy";
import { InMemoryUser, inMemoryUsers } from "@/src/inMemoryDB";
import { bot } from "@/src/config";

export async function notifyMissedAttestations(
  userId: number,
  threshold: number
) {
  const user = inMemoryUsers[userId];
  if (!user.validatorsMissedLastFive?.length) return;

  // filter validators that are inactive
  const activeValidators = user.validatorsMissedLastFive?.filter(
    (validatorId) => !user.status?.inactiveIds.includes(validatorId)
  );

  const amount = activeValidators?.length;
  if (!amount) return;

  const msg = `
  ⚠️ ${amount} validators have missed the last ${threshold} attestations!
`;

  const inlineKeyboard = new InlineKeyboard().text("ok", "remove_message");

  bot.api.sendMessage(user.chatId, msg, { reply_markup: inlineKeyboard });
}
