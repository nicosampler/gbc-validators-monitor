import { GenericResponse } from "@/src/API_beaconchain/endpoints";

export type API_ValidatorEth1 = GenericResponse<
  {
    public_key: string;
    valid_signature: boolean;
    validator_index: number;
  }[]
>;

export type API_ValidatorIdDeposit = GenericResponse<
  {
    amount: number;
    block_number: number;
    block_ts: number;
    from_address: string;
    merkletree_index: string;
    publickey: string;
    removed: true;
    signature: string;
    tx_hash: string;
    tx_index: number;
    tx_input: string;
    valid_signature: boolean;
    withdrawal_credentials: string;
  }[]
>;

export type API_ValidatorInfo = {
  activationeligibilityepoch: number;
  activationepoch: number;
  balance: number;
  effectivebalance: number;
  exitepoch: number;
  lastattestationslot: number;
  name: string;
  pubkey: string;
  slashed: boolean;
  status: string;
  validatorindex: number;
  withdrawableepoch: number;
  withdrawalcredentials: string;
  total_withdrawals: number;
};

export type API_ValidatorPerformance = {
  balance: number;
  performance1d: number;
  performance31d: number;
  performance365d: number;
  performance7d: number;
  performancetoday: number;
  performancetotal: number;
  rank7d: number;
  validatorindex: number;
};

export type API_ValidatorWithdrawalCredentials = {
  publickey: string;
  validatorindex: number;
};

export type API_Attestations = {
  attesterslot: number;
  committeeindex: number;
  epoch: number;
  inclusionslot: number;
  status: number;
  validatorindex: number;
  week: number;
  week_start: string;
  week_end: string;
};
