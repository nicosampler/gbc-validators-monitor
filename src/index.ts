import "dotenv/config";

import { scheduleUsersTasks } from "./scheduler/scheduleNewUserTasks";
import { stats } from "./commands/stats";
import { bot } from "./config";
import { loadValidators } from "./commands/loadValidatros";
import { help } from "./commands/help";
import { removeMessage } from "@/src/commands/removeMessage";
import { deleteUser } from "@/src/commands/deleteUser";
import { getPrisma } from "@/src/config/prisma";
import { loadInMemoryUsers } from "@/src/utils/loadInMemoryUsers";
import { myWithdrawalAddresses } from "@/src/commands/myWithdrawalAddresses";
import { claim } from "@/src/commands/claim";

const prisma = getPrisma();

async function main() {
  loadInMemoryUsers();

  bot.start();

  scheduleUsersTasks();

  // commands
  bot.command("start", help);
  bot.command("load_validators", loadValidators);
  bot.command("stats", stats);
  bot.command("help", help);
  bot.command("delete_account", deleteUser);
  bot.command("my_addresses", myWithdrawalAddresses);
  bot.command("claim", claim);

  bot.callbackQuery("remove_message", (ctx) => {
    if (!ctx.chat?.id || !ctx.msg?.message_id) return;
    removeMessage(ctx.chat.id, ctx.msg.message_id);
  });

  // help command
  await bot.api.setMyCommands([
    // { command: "start", description: "Start the bot" },
    { command: "help", description: "Show help text" },
    {
      command: "load_validators",
      description: "Load validators by entering a {{withdrawal_address}}",
    },
    {
      command: "stats",
      description: "Show your stats",
    },
    {
      command: "my_addresses",
      description: "Show your withdrawal addresses",
    },
    {
      command: "claim",
      description: "Claim your GNO rewards",
    },
    {
      command: "delete_account",
      description: "Delete your account",
    },
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
