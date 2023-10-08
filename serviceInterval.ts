import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { Db as DbType } from "mongodb";

import { getUserData, requestStationAndUpsert } from "./db";
import { handleTickets, sendNotifications } from "./notifUtils";
import { NotifierType } from "./types";

let timeInterval = process.env.TIME_INTERVAL
  ? parseInt(process.env.TIME_INTERVAL)
  : 1000 * 60 * 60; // 1 hour

export const startInterval = (interval: NodeJS.Timeout, db: DbType) => {
  interval = setInterval(async () => {
    const notifiers = await db
      .collection<NotifierType>("Notifiers")
      .find({})
      .toArray();
    console.log("notifiers:", notifiers);
    const dataRequests = await Promise.all(
      notifiers.map((notifier) => {
        return Promise.all([
          requestStationAndUpsert(db, notifier.stationId),
          getUserData(db, notifier.owner_id),
          notifier,
        ]);
      }),
    );
    console.log("dataRequests:", JSON.stringify(dataRequests, null, 2));
    const messages = dataRequests.reduce<ExpoPushMessage[]>(
      (acc, [stationData, userData, notifier]) => {
        if (
          !userData ||
          !userData.expoPushToken ||
          !Expo.isExpoPushToken(userData.expoPushToken)
        ) {
          return acc;
        }
        // const shouldNotifyUser =
        //   aqi >= notifier.threshold && !userData.isNotified;
        // const shouldGiveAllClear =
        //   aqi < notifier.threshold && userData.isNotified;
        const shouldNotifyAbove = stationData.aqi >= notifier.threshold;
        const shouldNotifyBelow = stationData.aqi < notifier.threshold;

        const commonMessageData: ExpoPushMessage = {
          to: userData.expoPushToken,
          sound: "default",
          priority: "normal",
          data: { stationId: stationData.stationId },
        };
        if (shouldNotifyAbove) {
          const message: ExpoPushMessage = {
            ...commonMessageData,
            title: "BreatheEasy Alert",
            body: `${stationData.shortName} AQI has increased to ${stationData.aqi}`,
          };
          acc.push(message);
        } else if (shouldNotifyBelow) {
          const message: ExpoPushMessage = {
            ...commonMessageData,
            title: "BreatheEasy All Clear",
            body: `${stationData.shortName} AQI has decreased to ${stationData.aqi}`,
          };
          acc.push(message);
        }

        return acc;
      },
      [],
    );

    console.log("messages:", JSON.stringify(messages, null, 2));

    //send notifications
    const ticketIds = await sendNotifications(messages);
    handleTickets(ticketIds, {
      onGetReceiptError: (error) => {
        console.error(error);
      },
      onPushTicketError: (ticket) => {
        console.error(
          `There was an error sending a notification: ${ticket.message}`,
          JSON.stringify(ticket.details),
        );
      },
      onReceiptError: (receiptId, receipt) => {
        console.error(
          `There was an error with the receipt: ${receiptId}`,
          JSON.stringify(receipt),
        );
      },
    });
  }, timeInterval);
};
