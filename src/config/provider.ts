import { gnosisRpc } from "@/src/config";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcBatchProvider(gnosisRpc);

export const signer = new ethers.Wallet(process.env.PK as string, provider);

export default provider;
