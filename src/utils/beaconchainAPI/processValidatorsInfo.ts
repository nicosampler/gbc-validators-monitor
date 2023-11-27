import { API_ValidatorInfo } from "@/src/API_beaconchain/types";
import { EFFECTIVE_BALANCE } from "@/src/constants";

export type ValidatorStatus = {
  validators: number;
  active: number;
  slashedIds: number[];
  inactiveIds: number[];
  totalWithdrawals: number;
};

export function processValidatorsInfo(
  validatorInfo: API_ValidatorInfo[]
): ValidatorStatus {
  const res = validatorInfo.reduce<ValidatorStatus>(
    (acc, curr) => {
      switch (curr.status) {
        case "active_online":
          acc.active++;
          break;
        case "active_offline":
          acc.inactiveIds.push(curr.validatorindex);
          break;
        default:
          if (curr.slashed) {
            acc.slashedIds.push(curr.validatorindex);
          }
      }
      acc.validators++;
      acc.totalWithdrawals += curr.total_withdrawals;
      return acc;
    },
    {
      validators: 0,
      active: 0,
      slashedIds: [],
      inactiveIds: [],
      totalWithdrawals: 0,
    }
  );
  res.totalWithdrawals =
    res.totalWithdrawals > 0 ? res.totalWithdrawals / EFFECTIVE_BALANCE : 0;

  return res;
}
