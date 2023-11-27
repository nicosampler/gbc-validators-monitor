import { bot } from "@/src/config";

export async function removeMessage(chatId: number, messageId: number) {
  console.log(`Remove message - ChatId:${chatId}, MessageId: ${messageId}`);
  await bot.api.deleteMessage(chatId, messageId);
}
