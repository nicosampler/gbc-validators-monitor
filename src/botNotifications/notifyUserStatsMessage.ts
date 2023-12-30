import format from "date-fns/format";
import { bot } from "../config";
import { gnoPrice } from "@/src/scheduler/tasks/gnoPriceTask";
import { inMemoryUsers } from "@/src/inMemoryDB";
import { getUserXDaiRewards } from "@/src/utils/prisma/getUserXDaiRewards";

export async function notifyUserStatsMessage(
  userId: number
): Promise<number | undefined> {
  const user = inMemoryUsers[userId];
  const performance = user.performance;
  const status = user.status;

  // const xDaiRewards = await getUserXDaiRewards(user.id);

  const totalBalance = performance?.balance || 0;
  const totalBalancePrice = (totalBalance * gnoPrice).toFixed(2);

  const performance1d = performance?.performance1d || 0;
  const performance7d = performance?.performance7d || 0;
  const performance31d = performance?.performance31d || 0;
  const performance1dPrice = (performance1d * gnoPrice).toFixed(2);
  const performance7dPrice = (performance7d * gnoPrice).toFixed(2);
  const performance31dPrice = (performance31d * gnoPrice).toFixed(2);

  const withdrawable = user.withdrawable || 0;
  const withdrawablePrice = withdrawable * gnoPrice;
  const withdrawableFormatted = withdrawable.toFixed(4);
  const withdrawablePriceFormatted = withdrawablePrice.toFixed(2);

  const totalValidators =
    (status?.active || 0) +
    (status?.inactiveIds?.length || 0) +
    (status?.slashedIds?.length || 0);

  const msg =
    "`" +
    `Validators: ${totalValidators}.
  ${status?.active || 0} 🟢 | ${status?.inactiveIds.length || 0} 🟡 | ${
      status?.slashedIds.length || 0
    } 🚫      

Attestations: ${user.last100AttestedPercentage || "-"}%
Balance: ${totalBalance.toFixed(3)} GNO ($${totalBalancePrice}) 
Claimable: ${withdrawableFormatted} GNO ($${withdrawablePriceFormatted})

Performance
---------------------------
1d  | ${performance1d.toFixed(4)} GNO ($${performance1dPrice})
7d  | ${performance7d.toFixed(4)} GNO ($${performance7dPrice})
31d | ${performance31d.toFixed(4)} GNO ($${performance31dPrice})

🔄 ${format(new Date(), "MM/dd hh:mm")} UTC  - 🦉 $${gnoPrice.toFixed(2)}
  ` +
    "`";

  let _messageId = user.messageId;
  const chatId = user.chatId;

  // send stats message
  if (_messageId) {
    try {
      await bot.api.editMessageText(chatId, _messageId, msg, {
        parse_mode: "MarkdownV2",
      });
      return _messageId;
    } catch (error: any) {
      console.error(error);
      if (
        error.description !==
        "Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message"
      ) {
        _messageId = undefined; // reset messageId to null if editMessageText fails
      }
    }
  }

  // send new message if messageId is null
  if (!_messageId) {
    try {
      const messageRes = await bot.api.sendMessage(chatId, msg, {
        disable_notification: true,
        parse_mode: "MarkdownV2",
      });

      return messageRes.message_id;
    } catch (error) {
      console.error(error);
    }
  }
}
