import axios, { AxiosResponse } from "axios";
import { AsyncTask, Task } from "toad-scheduler";

export let gnoPrice = 0;

export function gnoPriceTaskImp(): Promise<number> {
  return axios
    .get<any, AxiosResponse<{ gnosis: { usd: number } }>>(
      "https://api.coingecko.com/api/v3/simple/price?ids=gnosis&vs_currencies=usd"
    )
    .then((res) => {
      gnoPrice = res.data.gnosis.usd;
      return gnoPrice;
    })
    .catch((err) => {
      console.log(err);
      return gnoPrice;
    });
}

export const gnoPriceTask = new AsyncTask("gnoPrice", () =>
  gnoPriceTaskImp().catch(console.error)
);
