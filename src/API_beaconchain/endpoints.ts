import {
  API_ValidatorInfo,
  API_ValidatorPerformance,
  API_ValidatorWithdrawalCredentials,
  API_Attestations,
} from "./types";
import { beaconchaInstance } from "../config/beconChainAPI";
import { API_BEACONCHA_URL } from "../constants";

function splitIdsInChunks<T>(ids: T[], size = 100): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < ids.length; i += size) {
    const chunk = ids.slice(i, i + size);
    chunks.push(chunk);
  }
  return chunks;
}

export type GenericResponse<T> = {
  data: T;
  status: string;
};

export async function loadValidatorsByWithdrawalAddresses(
  wa: string[]
): Promise<number[]> {
  const results: API_ValidatorWithdrawalCredentials[] = [];
  let offset = 0;
  let shouldRetry = true;

  while (shouldRetry) {
    const res = await beaconchaInstance.get<
      GenericResponse<API_ValidatorWithdrawalCredentials[]>
    >(`${API_BEACONCHA_URL}/validator/withdrawalCredentials/${wa.join(",")}`, {
      params: { limit: 200, offset },
    });

    offset += 200; // Adjust the offset for the next page
    shouldRetry = res.data.data.length === 200; // Stop retrying if the number of results is not 200

    // add validator to results if it's not already there
    res.data.data.forEach((validator) => {
      if (!results.some((v) => v.validatorindex === validator.validatorindex)) {
        results.push(validator);
      }
    });
  }

  return results.map((v) => v.validatorindex);
}

export async function getValidatorsPerformance(
  ids: number[]
): Promise<API_ValidatorPerformance[]> {
  const chunks = splitIdsInChunks(ids);

  const promises = chunks.map((chunk) =>
    beaconchaInstance.get<GenericResponse<API_ValidatorPerformance[]>>(
      `${API_BEACONCHA_URL}/validator/${chunk.join(",")}/performance`
    )
  );

  const results = await Promise.all(promises);

  return results.flatMap((res) => res.data.data);
}

export async function getValidatorsInfo(
  ids: number[]
): Promise<API_ValidatorInfo[]> {
  const chunks = splitIdsInChunks(ids);

  const results: API_ValidatorInfo[] = [];
  for (const chunk of chunks) {
    const res = await beaconchaInstance.get<
      GenericResponse<API_ValidatorInfo[]>
    >(`${API_BEACONCHA_URL}/validator/${chunk.join(",")}`);

    results.push(...res.data.data);
  }

  return results;
}

export async function getAttestations(
  validatorIds: number[]
): Promise<API_Attestations[]> {
  const chunks = splitIdsInChunks(validatorIds);

  const results: API_Attestations[] = [];
  for (const chunk of chunks) {
    const res = await beaconchaInstance.get<
      GenericResponse<API_Attestations[]>
    >(`${API_BEACONCHA_URL}/validator/${chunk.join(",")}/attestations`);

    results.push(...res.data.data);
  }

  return results;
}
