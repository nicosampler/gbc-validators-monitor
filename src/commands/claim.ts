import { bot } from "@/src/config";
import { deleteUser as _deleteUser } from "@/src/utils/prisma/deleteUser";
import { CommandContext, Context } from "grammy";
import { getUserIdFromCtx } from "../utils/telegram/getUserIdFromCtx";
import { getDBWithdrawalAddresses } from "@/src/utils/prisma/getWithdrawalAddresses";
import { signer } from "@/src/config/provider";
import gbcDepositInstance from "@/src/utils/evm/GBCDeposit";
import { Message } from "grammy/types";
import { inMemoryUsers } from "@/src/inMemoryDB";
import { getPrisma } from "@/src/config/prisma";
import { getUser } from "@/src/utils/prisma/getUser";
import addDays from "date-fns/addDays";
import { compareAsc } from "date-fns";
import format from "date-fns/format";

const prisma = getPrisma();

export async function claim(ctx: CommandContext<Context>) {
  let tmpReply: Message.TextMessage | null = null;
  try {
    // Claiming
    tmpReply = await ctx.reply(
      `Claiming... Please be patient, it may take a few minutes!`
    );

    // recover userId
    const userId = await getUserIdFromCtx(ctx);
    if (!userId) return false;

    // check if user can claim
    const userDB = await getUser(userId);
    const now = new Date();
    const claimCooldown = addDays(
      userDB.lastClaimed || new Date("01/01/2020"),
      Number(process.env.CLAIM_COOLDOWN_DAYS)
    );
    if (compareAsc(claimCooldown, now) > 0) {
      // Notify the date when the user can claim again
      await bot.api.editMessageText(
        tmpReply.chat.id,
        tmpReply.message_id,
        `😢 You can claim again at ${format(
          claimCooldown,
          "MM/dd/yyyy hh:mm"
        )} UTC.`
      );
      return;
    }

    // get withdrawal addresses
    const wa = await getDBWithdrawalAddresses(userId);
    if (!wa.length) {
      await bot.api.editMessageText(
        tmpReply.chat.id,
        tmpReply.message_id,
        "😢 No withdrawal address found!"
      );
      return;
    }

    // send claim tx
    const tx = await gbcDepositInstance
      .connect(signer)
      .claimWithdrawals(wa.map((w) => w.address));
    const receipt = await tx.wait();

    // Notify user
    await bot.api.editMessageText(
      tmpReply.chat.id,
      tmpReply.message_id,
      `🤑 Claim sent. ${process.env.EXPLORER_URL}/tx/${receipt.transactionHash}`
    );

    // update user.
    inMemoryUsers[userId].withdrawable = 0;
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastClaimed: new Date(),
      },
    });
  } catch (error) {
    console.error(error);

    if (tmpReply) {
      await bot.api.editMessageText(
        tmpReply.chat.id,
        tmpReply.message_id,
        "😢 Something went wrong, please try again later!"
      );
    } else {
      await bot.api.sendMessage(
        ctx.chat.id,
        "😢 Something went wrong, please try again later!"
      );
    }
  }
}
