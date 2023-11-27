import {
  performanceTask,
  performanceTaskImp,
} from "@/src/scheduler/tasks/performanceTask";
import {
  attestationsTask,
  attestationsTaskImp,
} from "@/src/scheduler/tasks/attestationsTask";
import {
  withdrawableTask,
  withdrawableTaskImp,
} from "@/src/scheduler/tasks/withdrawableTask";
import {
  gnoPriceTask,
  gnoPriceTaskImp,
} from "@/src/scheduler/tasks/gnoPriceTask";
import { statusTask, statusTaskImp } from "@/src/scheduler/tasks/statusTask";
import {
  updateUsersStats,
  updateUsersStatsImp,
} from "@/src/scheduler/tasks/updateUsersStats";
import {
  syncBlockRewardsImp,
  syncBlockRewardsTask,
} from "@/src/scheduler/tasks/syncBlockRewards";

export const allTasks = {
  performance: { task: performanceTask, imp: performanceTaskImp },
  attestations: { task: attestationsTask, imp: attestationsTaskImp },
  withdrawable: { task: withdrawableTask, imp: withdrawableTaskImp },
  gnoPrice: { task: gnoPriceTask, imp: gnoPriceTaskImp },
  status: { task: statusTask, imp: statusTaskImp },
  notifyUsers: { task: updateUsersStats, imp: updateUsersStatsImp },
  syncBlockRewards: { task: syncBlockRewardsTask, imp: syncBlockRewardsImp },
};
