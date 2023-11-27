import { Bot } from "grammy";
import { ToadScheduler } from "toad-scheduler";

export const gnosisRpc = "https://rpc.gnosischain.com";
export const GBCDepositAddress = "0x0b98057ea310f4d31f2a452b414647007d1645d9"

export const bot = new Bot(process.env.BOT_TOKEN!);
export const scheduler = new ToadScheduler();
