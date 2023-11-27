/**
 * This module exports an AsyncTask instance that retrieves the withdrawable amount for each user and updates their stats.
 * @remarks
 * The `withdrawableTask` AsyncTask retrieves the withdrawable amount for each user.
 * The amounts are then aggregated by user and their stats are updated in the in-memory database.
 */

import { inMemoryUsers } from "@/src/inMemoryDB";
import gbcDepositInstance from "@/src/utils/evm/GBCDeposit";
import { getDBWithdrawalAddresses } from "@/src/utils/prisma/getWithdrawalAddresses";
import { BigNumber, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { AsyncTask } from "toad-scheduler";

export const withdrawableTaskImp = async (userId?: number) => {
  const withdrawalAddresses = await getDBWithdrawalAddresses(userId);

  const promises = withdrawalAddresses.map(async ({ address }) => {
    const amount: BigNumber = await gbcDepositInstance.withdrawableAmount(
      address
    );
    return {
      withdrawalAddress: address,
      amount,
    };
  });

  const amountsInfo = await Promise.all(promises);

  const amountsByUser = amountsInfo.reduce((acc, info) => {
    withdrawalAddresses
      .filter((wa) => wa.address === info.withdrawalAddress)
      .map((wa) => wa.users.map((u) => u.id))
      .forEach((userIds) => {
        userIds.forEach((userId) => {
          acc[userId] = acc[userId] || ethers.constants.Zero;
          acc[userId] = acc[userId].add(info.amount);
        });
      });

    return acc;
  }, {} as Record<number, BigNumber>);

  Object.entries(amountsByUser).forEach(([_userId, amount]) => {
    const userId = +_userId;
    const user = inMemoryUsers[userId];
    if (!user) return;

    user.withdrawable = +formatEther(amount.toString());
  });
};

/**
 * AsyncTask instance that retrieves the withdrawable amount for each user and updates their stats.
 */
export const withdrawableTask = new AsyncTask("withdrawable", () =>
  withdrawableTaskImp().catch(console.error)
);
