import { getDBValidators } from "@/src/utils/prisma/getValidatros";
import { AsyncTask } from "toad-scheduler";

import { getValidatorsPerformance } from "@/src/API_beaconchain/endpoints";
import { API_ValidatorPerformance } from "@/src/API_beaconchain/types";
import { inMemoryUsers } from "@/src/inMemoryDB";
import {
  ValidatorPerformance,
  processValidatorsPerformance,
} from "@/src/utils/beaconchainAPI/processValidatorsPerformance";

/**
 * Updates the performance stats for the given validators and notifies the users.
 * @param userId The ID of the user to update the performance stats for.
 * @returns An array of updated user objects.
 */
export const performanceTaskImp = async (userId?: number) => {
  const validators = await getDBValidators(userId);
  const validatorsPerformance = await getValidatorsPerformance(
    validators.map((v) => v.id)
  );

  // Assign to each user the performance of its validators
  const performanceByUser = validatorsPerformance.reduce(
    (acc, validatorPerformance) => {
      validators
        .filter((v) => v.id === validatorPerformance.validatorindex)
        .map((v) => v.users.map((u) => u.id))
        .forEach((userIds) => {
          userIds.forEach((userId) => {
            acc[userId] = acc[userId] || [];
            acc[userId].push(validatorPerformance);
          });
        });

      return acc;
    },
    {} as Record<number, API_ValidatorPerformance[]>
  );

  // calculate validators's performance for each user
  // userId -> ValidatorPerformance[]
  const validatorsPerformanceByUser = Object.entries(performanceByUser).reduce(
    (acc, [userId, validators]) => {
      acc[+userId] = processValidatorsPerformance(validators);
      return acc;
    },
    {} as Record<number, ValidatorPerformance>
  );

  // Update in memory user
  return Object.keys(validatorsPerformanceByUser)
    .map(Number)
    .forEach(async (userId) => {
      const user = inMemoryUsers[userId];
      if (!user) return;

      const validatorPerformance = validatorsPerformanceByUser[userId];
      user.performance = validatorPerformance;
    });
};

export const performanceTask = new AsyncTask("performance", () =>
  performanceTaskImp().catch(console.error)
);
