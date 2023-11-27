import { limitRequests } from "@/src/utils/beaconChainRateLimiter";
import axios, { InternalAxiosRequestConfig } from "axios";
import * as AxiosLogger from "axios-logger";

const instance = axios.create();

// interceptor to limit requests
instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    await limitRequests(() => Promise.resolve());
    return config;
  }
);

// log response
instance.interceptors.response.use((response) => {
  // write down your response intercept.
  console.log(new Date().toISOString());
  return AxiosLogger.responseLogger(response);
});

AxiosLogger.setGlobalConfig({
  data: false,
});

export const beaconchaInstance = instance;
