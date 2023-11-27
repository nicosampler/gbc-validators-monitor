import { AsyncTask } from "toad-scheduler";
import { processAttestations } from "@/src/utils/beaconchainAPI/processAttestations";
import { getPrisma } from "@/src/config/prisma";
import { inMemoryUsers } from "@/src/inMemoryDB";
import { getAttestations } from "@/src/API_beaconchain/endpoints";
import { API_Attestations } from "@/src/API_beaconchain/types";
import { getDBValidators } from "@/src/utils/prisma/getValidatros";

const prisma = getPrisma();

export const attestationsTaskImp = async (userId?: number) => {
  const validators = await getDBValidators(userId);

  const attestationResponse = await getAttestations(
    validators.map((v) => v.id)
  );

  if (!attestationResponse) return {};

  // userId => validatorId => attestations
  const userValidatorAttestations = attestationResponse.reduce(
    (acc, attestation) => {
      // get all userIds associated with this validator
      const userIDs = validators.reduce((acc, validator) => {
        if (validator.id === attestation.validatorindex) {
          acc.push(...validator.users.map((u) => u.id));
        }
        return acc;
      }, [] as number[]);

      // Iterate through each validator's attestations
      for (const userId of userIDs) {
        acc[userId] ||= {};
        acc[userId][attestation.validatorindex] ||= [];
        acc[userId][attestation.validatorindex].push(attestation);
      }

      return acc;
    },
    {} as Record<number, Record<number, API_Attestations[]>>
  );

  // Process each user
  for (const [userId, attestationsByValidator] of Object.entries(
    userValidatorAttestations
  )) {
    try {
      // get in-memory user
      const user = inMemoryUsers[+userId];
      if (!user) continue;

      const amountOfValidators = Object.keys(attestationsByValidator).length;
      let attestedSum = 0;
      user.validatorsMissedLastFive = [];

      // Process each validator's attestations
      // validatorId => attestations
      for (const [validatorId, attestations] of Object.entries(
        attestationsByValidator
      )) {
        const processedAttestations = processAttestations(attestations);

        attestedSum += processedAttestations.last100Performance;
        if (processedAttestations.lastFiveMissed) {
          user.validatorsMissedLastFive.push(+validatorId);
        }
      }

      user.last100AttestedPercentage = +(
        attestedSum / amountOfValidators
      ).toFixed(2);
    } catch (error) {
      console.error(error);
    }
  }
};

export const attestationsTask = new AsyncTask("performance", () =>
  attestationsTaskImp().catch(console.error)
);
