import {
  blockRewards,
  getBlockNumberByDate,
} from "@/src/API_gnosisScan/endpoints";
import { getPrisma } from "@/src/config/prisma";
import provider from "@/src/config/provider";
import { LAST_DAYS_REWARDS } from "@/src/constants";
import { getLastBlockRewardIndexed } from "@/src/utils/prisma/getLastBlockRewardIndexed";
import { subDays } from "date-fns";
import { AsyncTask } from "toad-scheduler";

const prisma = getPrisma();

export const syncBlockRewardsImp = async () => {
  const lastBlock = await provider.getBlockNumber();

  const blockFrom = await getBlockNumberByDate(
    subDays(new Date(), LAST_DAYS_REWARDS)
  );

  if (!blockFrom) {
    console.log("No block found");
    return;
  }

  const lastBlockIndexed =
    (await getLastBlockRewardIndexed())?.blockNumber ?? blockFrom;

  let fromBlock =
    lastBlockIndexed > blockFrom ? lastBlockIndexed + 1 : blockFrom;

  while (fromBlock < lastBlock) {
    const block = await blockRewards(fromBlock);

    if (!block) {
      continue;
    }

    await prisma.blockRewards.create({
      data: {
        blockNumber: +block.blockNumber,
        timeStamp: new Date(+block.timeStamp * 1000),
        blockMiner: block.blockMiner.toLowerCase(),
        blockReward: block.blockReward,
        uncleInclusionReward: block.uncleInclusionReward,
      },
    });

    fromBlock++;
  }
};

export const syncBlockRewardsTask = new AsyncTask("blockRewards", () =>
  syncBlockRewardsImp().catch(console.error)
);
