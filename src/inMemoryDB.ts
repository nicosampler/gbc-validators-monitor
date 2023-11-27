import { ValidatorStatus } from "@/src/utils/beaconchainAPI/processValidatorsInfo";
import { ValidatorPerformance } from "@/src/utils/beaconchainAPI/processValidatorsPerformance";

export type InMemoryUser = {
  id: number;
  chatId: number;
  messageId?: number;
  withdrawable?: number;
  performance?: ValidatorPerformance;
  last100AttestedPercentage?: number;
  validatorsMissedLastFive?: number[];
  status?: ValidatorStatus;
  prevNotifiedStatus?: {
    inactiveIds: number[];
  };
  notified?: {
    underPerformance?: Date;
  };
};

export const inMemoryUsers: Record<number, InMemoryUser> = {};

export function isUserReady(userId: number) {
  return (
    inMemoryUsers[userId]?.performance != undefined &&
    inMemoryUsers[userId]?.status != undefined &&
    inMemoryUsers[userId]?.withdrawable != undefined &&
    inMemoryUsers[userId]?.last100AttestedPercentage != undefined
  );
}

export function resetUser(userId: number) {
  if (!inMemoryUsers[userId]) return;

  const chatId = inMemoryUsers[userId].chatId;

  inMemoryUsers[userId] = {
    id: userId,
    chatId,
    messageId: undefined,
  };
}
