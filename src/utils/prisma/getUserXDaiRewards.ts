import { getPrisma } from "@/src/config/prisma";
import { LAST_DAYS_REWARDS } from "@/src/constants";
import subDays from "date-fns/subDays";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

const prisma = getPrisma();

export async function getUserXDaiRewards(userId: number): Promise<number> {
  const userDB = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { withdrawalAddresses: true },
  });

  const from = new Date();
  const to = subDays(from, LAST_DAYS_REWARDS);

  const blockRewardsPromises = userDB.withdrawalAddresses.map(
    async ({ address }) => {
      return prisma.blockRewards.findMany({
        where: { blockMiner: address, timeStamp: { gte: to, lte: from } },
      });
    }
  );

  const blockRewardsPerAddress = await Promise.all(blockRewardsPromises);

  const totalAmount = blockRewardsPerAddress.reduce((acc, curr) => {
    const blockRewardSum = curr.reduce((acc, curr) => {
      return acc.add(BigNumber.from(curr.blockReward));
    }, BigNumber.from(0));
    return acc.add(blockRewardSum);
  }, BigNumber.from(0));

  return +formatUnits(totalAmount.toString(), 18);
}
