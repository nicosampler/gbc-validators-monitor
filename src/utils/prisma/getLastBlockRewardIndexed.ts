import { getPrisma } from "@/src/config/prisma";

const prisma = getPrisma();

export function getLastBlockRewardIndexed() {
  return prisma.blockRewards.findFirst({ orderBy: { blockNumber: "desc" } });
}
