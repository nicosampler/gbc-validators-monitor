import { SimpleIntervalJob } from "toad-scheduler";

import { allTasks } from "@/src/scheduler/tasks/allTasks";
import { scheduler } from "@/src/config";

const PERFORMANCE_JOB_TIME = Number(process.env.PERFORMANCE_JOB_TIME);
const STATUS_JOB_TIME = Number(process.env.STATUS_JOB_TIME);
const ATTESTATIONS_JOB_TIME = Number(process.env.ATTESTATIONS_JOB_TIME);
const WITHDRAWABLE_JOB_TIME = Number(process.env.WITHDRAWABLE_JOB_TIME);
const GNO_PRICE_JOB_TIME = Number(process.env.GNO_PRICE_JOB_TIME);
const NOTIFY_USERS_JOB_TIME = Number(process.env.GNO_PRICE_JOB_TIME);
const BLOCK_REWARDS_JOB_TIME = Number(process.env.BLOCK_REWARDS_JOB_TIME);

if (
  isNaN(Number(PERFORMANCE_JOB_TIME)) ||
  isNaN(Number(STATUS_JOB_TIME)) ||
  isNaN(Number(ATTESTATIONS_JOB_TIME)) ||
  isNaN(Number(WITHDRAWABLE_JOB_TIME)) ||
  isNaN(Number(GNO_PRICE_JOB_TIME)) ||
  isNaN(Number(NOTIFY_USERS_JOB_TIME)) ||
  isNaN(Number(BLOCK_REWARDS_JOB_TIME))
) {
  throw new Error(
    "One or more environment variables are missing or not a number"
  );
}

export function scheduleUsersTasks() {
  // performance
  // it gets the aprox earnings for 1d, 7d, 31d
  // it also bring validators balances
  const performanceJob = new SimpleIntervalJob(
    { minutes: PERFORMANCE_JOB_TIME, runImmediately: true },
    allTasks.performance.task,
    {
      id: "performance",
      preventOverrun: true,
    }
  );
  scheduler.addSimpleIntervalJob(performanceJob);

  // status
  const statusJob = new SimpleIntervalJob(
    { minutes: STATUS_JOB_TIME, runImmediately: true },
    allTasks.status.task,
    {
      id: "status",
      preventOverrun: true,
    }
  );
  scheduler.addSimpleIntervalJob(statusJob);

  // Attestations
  const attestationsJob = new SimpleIntervalJob(
    { minutes: ATTESTATIONS_JOB_TIME, runImmediately: true },
    allTasks.attestations.task,
    {
      id: "attestations",
      preventOverrun: true,
    }
  );
  scheduler.addSimpleIntervalJob(attestationsJob);

  // withdrawable
  const withdrawableJob = new SimpleIntervalJob(
    { minutes: WITHDRAWABLE_JOB_TIME, runImmediately: true },
    allTasks.withdrawable.task,
    {
      id: "withdrawable",
      preventOverrun: true,
    }
  );
  scheduler.addSimpleIntervalJob(withdrawableJob);

  // gno price
  const gnoPriceJob = new SimpleIntervalJob(
    { minutes: GNO_PRICE_JOB_TIME, runImmediately: true },
    allTasks.gnoPrice.task,
    {
      id: "gnoPrice",
      preventOverrun: true,
    }
  );
  scheduler.addSimpleIntervalJob(gnoPriceJob);

  // user's notifications
  const notifyUsersJob = new SimpleIntervalJob(
    { minutes: NOTIFY_USERS_JOB_TIME, runImmediately: true },
    allTasks.notifyUsers.task,
    {
      id: "notifyUsers",
      preventOverrun: true,
    }
  );
  scheduler.addSimpleIntervalJob(notifyUsersJob);

  // sync block rewards
  // const syncBlockRewardsJob = new SimpleIntervalJob(
  //   { seconds: BLOCK_REWARDS_JOB_TIME, runImmediately: true },
  //   allTasks.syncBlockRewards.task,
  //   {
  //     id: "syncBlockRewards",
  //     preventOverrun: true,
  //   }
  // );
  // scheduler.addSimpleIntervalJob(syncBlockRewardsJob);
}
