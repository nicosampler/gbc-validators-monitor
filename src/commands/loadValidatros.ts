import { isAddress } from "@ethersproject/address";
import { CommandContext, Context } from "grammy";
import { getUserIdFromCtx } from "../utils/telegram/getUserIdFromCtx";
import { loadValidatorsByWithdrawalAddresses } from "../API_beaconchain/endpoints";

// import { User } from "@/src/config/memoryDB";
import { bot } from "@/src/config";
import { getPrisma } from "@/src/config/prisma";
import { Message } from "grammy/types";
import { inMemoryUsers, resetUser } from "@/src/inMemoryDB";
import { removeMessage } from "@/src/commands/removeMessage";

const prisma = getPrisma();

const maxValidatorsPerUser = process.env.MAX_VALIDATORS_PER_USER
  ? Number(process.env.MAX_VALIDATORS_PER_USER)
  : Number.MAX_SAFE_INTEGER;

export async function loadValidators(ctx: CommandContext<Context>) {
  let tmpReply: Message.TextMessage | null = null;

  try {
    const address = ctx.match.toLowerCase();

    // check if it is a valid eth address
    if (!isAddress(address)) {
      await ctx.reply(
        `Invalid address!. Please try again with a valid address. For example: "/load_validators 0x123..."`
      );
      return;
    }

    // get userId from telegram
    const userId = await getUserIdFromCtx(ctx);
    if (!userId) return;

    // Loading validators message
    tmpReply = await ctx.reply(
      `🔄 Loading validators... Please be patient, it may take a few minutes!`
    );

    // call the api to bring all the validators associated with the address
    const loadedValidators = await loadValidatorsByWithdrawalAddresses([
      address,
    ]);

    if (!loadedValidators.length) {
      await bot.api.editMessageText(
        tmpReply.chat.id,
        tmpReply.message_id,
        `No new validators found for this address`
      );
      return;
    }

    // get user from db
    const userDB = await prisma.user.findUnique({
      where: { id: userId },
      include: { validators: true, withdrawalAddresses: true },
    });

    const currentUserValidators = userDB?.validators ?? [];

    // check if the user has already reached the maximum number of validators
    if (currentUserValidators.length >= maxValidatorsPerUser) {
      await bot.api.editMessageText(
        tmpReply.chat.id,
        tmpReply.message_id,
        `You have reached the maximum number of validators per user (${maxValidatorsPerUser}).`
      );
      return;
    }

    // filter validators that are not already in the user
    const newValidators = loadedValidators.filter(
      (validatorId) =>
        !currentUserValidators.find(
          (userValidator) => userValidator.id == validatorId
        )
    );

    // limit validators to the maximum number of validators per user
    const validatorsToBeAdded = newValidators.slice(
      0,
      maxValidatorsPerUser - currentUserValidators.length
    );

    // create or update user
    if (!userDB) {
      await prisma.user.create({
        data: {
          id: userId,
          userId,
          chatId: ctx.chat.id,
          username: ctx.chat.type == "private" ? ctx.chat.username || "" : "",
          messageId: null,
          withdrawalAddresses: {
            connectOrCreate: { where: { address }, create: { address } },
          },
          validators: {
            connectOrCreate: validatorsToBeAdded.map((validatorindex) => ({
              where: { id: validatorindex },
              create: { id: validatorindex },
            })),
          },
        },
      });

      // add user to inMemoryDB
      inMemoryUsers[userId] = {
        id: userId,
        chatId: ctx.chat.id,
      };
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          messageId: null,
          withdrawalAddresses: userDB.withdrawalAddresses.find(
            (wa) => wa.address == address
          )
            ? {}
            : {
                connectOrCreate: { where: { address }, create: { address } },
              },
          validators: {
            connectOrCreate: validatorsToBeAdded.map((validatorindex) => ({
              where: { id: validatorindex },
              create: { id: validatorindex },
            })),
          },
        },
      });

      if (userDB.messageId) {
        removeMessage(userDB.messageId, userDB.chatId);
      }

      resetUser(userId);
    }

    await bot.api.editMessageText(
      tmpReply.chat.id,
      tmpReply.message_id,
      `
The address was processed successfully 💪!

${validatorsToBeAdded.length} validators were added to your account.
${
  newValidators.length > validatorsToBeAdded.length
    ? `
    ⚠️ ${
      newValidators.length - validatorsToBeAdded.length
    } validators were not added because you have reached the maximum number of validators per user (${maxValidatorsPerUser}).
    `
    : ""
}
- It might take some minutes to start providing stats -
`
    );
  } catch (error) {
    console.error(error);
    const errorMsg = `☠️ Oops! We encountered an issue while trying to load validators. Please give it another shot!`;
    await (tmpReply
      ? bot.api.editMessageText(tmpReply.chat.id, tmpReply.message_id, errorMsg)
      : ctx.reply(errorMsg));
  }
}
