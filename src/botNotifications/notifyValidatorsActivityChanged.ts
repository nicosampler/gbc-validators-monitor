import { bot } from "@/src/config";
import { InMemoryUser, inMemoryUsers } from "@/src/inMemoryDB";
import { InlineKeyboard } from "grammy";

export async function notifyValidatorsActivityChanged(userId: number) {
  const user = inMemoryUsers[userId];
  if (!user.status) return;

  user.prevNotifiedStatus = user.prevNotifiedStatus ?? {
    inactiveIds: [],
  };
  const prevInactiveIds = user.prevNotifiedStatus.inactiveIds;
  const currentStats = user.status;

  // get new inactive ids
  const newInactiveIds = currentStats.inactiveIds.filter(
    (id) => !prevInactiveIds.includes(id)
  );

  // get reactivated ids
  const reactivatedIds = prevInactiveIds.filter(
    (id) => !currentStats.inactiveIds.includes(id)
  );

  // update prevNotifiedStatus
  newInactiveIds.forEach((id) => prevInactiveIds.push(id));
  reactivatedIds.forEach((id) =>
    prevInactiveIds.splice(prevInactiveIds.indexOf(id), 1)
  );

  if (newInactiveIds.length > 0 || reactivatedIds.length > 0) {
    const msg = `
          ⚠️ Some validators have changed status!
          ${
            newInactiveIds.length > 0
              ? `🟡 Inactive: ${newInactiveIds.length}`
              : ""
          }
          ${
            reactivatedIds.length > 0
              ? `🟢 Active: ${reactivatedIds.length}`
              : ""
          }
        `;

    const inlineKeyboard = new InlineKeyboard().text("ok", "remove_message");
    bot.api.sendMessage(user.chatId, msg, {
      reply_markup: inlineKeyboard,
    });
  }
}
