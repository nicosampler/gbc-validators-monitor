import { AsyncTask } from "toad-scheduler";

import { getValidatorsInfo } from "@/src/API_beaconchain/endpoints";
import { API_ValidatorInfo } from "@/src/API_beaconchain/types";
import { inMemoryUsers } from "@/src/inMemoryDB";
import {
  ValidatorStatus,
  processValidatorsInfo,
} from "@/src/utils/beaconchainAPI/processValidatorsInfo";
import { getDBValidators } from "@/src/utils/prisma/getValidatros";

export const statusTaskImp = async (userId?: number) => {
  const validators = await getDBValidators(userId);
  const validatorsStats = await getValidatorsInfo(validators.map((v) => v.id));

  // Assign to each user the stats of its validators
  // userID => validatorStats[]
  const statsByUser = validatorsStats.reduce((acc, validatorStats) => {
    validators
      .filter((v) => v.id === validatorStats.validatorindex)
      .map((v) => v.users.map((u) => u.id))
      .forEach((userIds) => {
        userIds.forEach((userId) => {
          acc[userId] = acc[userId] || [];
          acc[userId].push(validatorStats);
        });
      });

    return acc;
  }, {} as Record<number, API_ValidatorInfo[]>);

  const processedStats = Object.keys(statsByUser)
    .map(Number)
    .reduce((stats, userId) => {
      stats[userId] = processValidatorsInfo(statsByUser[userId]);
      return stats;
    }, {} as Record<number, ValidatorStatus>);

  Object.keys(processedStats)
    .map((id) => +id)
    .forEach(async (userId) => {
      const newUserStatusStats = processedStats[userId];

      // read user info
      const user = inMemoryUsers[userId];
      if (!user) return;

      // save user info
      user.status = newUserStatusStats;
    });
};

export const statusTask = new AsyncTask("status", () =>
  statusTaskImp().catch(console.error)
);
