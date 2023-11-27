import { ethers } from "ethers";
import { GBCDepositAbi } from "@/src/constants/GBCDepositAbi";
import { GBCDepositAddress } from "@/src/config";
import provider from "@/src/config/provider";

const gbcDepositInstance = new ethers.Contract(
  GBCDepositAddress,
  GBCDepositAbi,
  provider
);

export default gbcDepositInstance;
