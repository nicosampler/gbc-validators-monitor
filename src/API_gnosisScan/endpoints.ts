import {
  API_GnosisScan_blockNumberByDate,
  API_GnosisScan_blockRewards,
} from "@/src/API_gnosisScan/types";
import { gnosisScanInstance } from "@/src/config/gnosisScanAPI";
import { API_GNOSISSCAN_URL } from "@/src/constants";

export type GenericResponse<T> = {
  status: string;
  message: string;
  result: T;
};

export async function blockRewards(
  blockNumber: number
): Promise<API_GnosisScan_blockRewards | null> {
  const res = await gnosisScanInstance.get<
    GenericResponse<API_GnosisScan_blockRewards>
  >(
    `${API_GNOSISSCAN_URL}/?module=block&action=getblockreward&blockno=${blockNumber}&apikey=${process.env.GNOSISSCAN_API_KEY}`
  );

  if (res.status !== 200 || res.data.message !== "OK") return null;
  return res.data.result;
}

export async function getBlockNumberByDate(
  timestamp: Date
): Promise<number | null> {
  const res = await gnosisScanInstance.get<
    GenericResponse<API_GnosisScan_blockNumberByDate>
  >(
    `${API_GNOSISSCAN_URL}/?module=block&action=getblocknobytime&timestamp=${Math.floor(
      timestamp.getTime() / 1000
    )}&closest=before&apikey=${process.env.GNOSISSCAN_API_KEY}`
  );

  if (res.status !== 200 || res.data.message !== "OK") return null;

  return +res.data.result;
}
