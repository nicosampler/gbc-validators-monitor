import { notifyMissedAttestations } from "@/src/botNotifications/notifyMissedAttestations";
import { notifyUnderPerformance } from "@/src/botNotifications/notifyUnderPerformance";
import { notifyUserStatsMessage } from "@/src/botNotifications/notifyUserStatsMessage";
import { notifyValidatorsActivityChanged } from "@/src/botNotifications/notifyValidatorsActivityChanged";
import { inMemoryUsers, isUserReady } from "@/src/inMemoryDB";
import { updateUserMessageId } from "@/src/utils/prisma/updateUserMessageId";
import { AsyncTask } from "toad-scheduler";

export async function updateUsersStatsImp(userId?: number) {
  const users = userId ? { [userId]: inMemoryUsers[userId] } : inMemoryUsers;

  Object.values(users).forEach(async (user) => {
    if (!isUserReady(user.id)) return;

    // stats notification
    const messageIdStats = await notifyUserStatsMessage(user.id);
    if (messageIdStats && messageIdStats !== user.messageId) {
      user.messageId = messageIdStats;
      updateUserMessageId(user.id, messageIdStats);
    }

    // missed Attestations
    notifyMissedAttestations(user.id, 5);

    // notify under performance
    notifyUnderPerformance(user.id, 90);

    // notify validators status changed
    notifyValidatorsActivityChanged(user.id);
  });
}

export const updateUsersStats = new AsyncTask("notifyUser", () =>
  updateUsersStatsImp().catch(console.error)
);
