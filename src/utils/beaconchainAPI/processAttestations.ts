import { API_Attestations } from "@/src/API_beaconchain/types";

export type Attestations = {
  lastFiveMissed: boolean;
  last100Performance: number;
};

export function processAttestations(
  attestations: API_Attestations[]
): Attestations {
  const last100Attested = attestations.reduce(
    (acc, curr) => (curr.status === 1 ? (acc += 1) : acc),
    0
  );

  return {
    lastFiveMissed: attestations
      .slice(0, 5)
      .every((attestation) => attestation.status === 0),
    last100Performance: (last100Attested / 100) * 100,
  };
}
