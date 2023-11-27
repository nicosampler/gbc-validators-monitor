import { API_ValidatorPerformance } from "../../API_beaconchain/types";
import { EFFECTIVE_BALANCE } from "../../constants";

export type ValidatorPerformance = {
  balance: number;
  performance1d: number;
  performance7d: number;
  performance31d: number;
};

export function processValidatorsPerformance(
  validatorsPerformance: API_ValidatorPerformance[]
): ValidatorPerformance {
  return validatorsPerformance.reduce(
    (acc, curr) => {
      acc.performance1d +=
        curr.performance1d > 0 ? curr.performance1d / EFFECTIVE_BALANCE : 0;
      acc.performance7d +=
        curr.performance7d > 0 ? curr.performance7d / EFFECTIVE_BALANCE : 0;
      acc.performance31d +=
        curr.performance31d > 0 ? curr.performance31d / EFFECTIVE_BALANCE : 0;
      acc.balance += curr.balance > 0 ? curr.balance / EFFECTIVE_BALANCE : 0;
      return acc;
    },
    {
      balance: 0,
      performance1d: 0,
      performance7d: 0,
      performance31d: 0,
    }
  );
}
