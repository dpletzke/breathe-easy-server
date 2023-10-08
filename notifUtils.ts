import { on } from "events";

import Expo, {
  ExpoPushErrorReceipt,
  ExpoPushMessage,
  ExpoPushSuccessTicket,
  ExpoPushTicket,
} from "expo-server-sdk";

let expo = new Expo();

export const sendNotifications = async (messages: ExpoPushMessage[]) => {
  const chunks = expo.chunkPushNotifications(messages);

  return Promise.all(
    chunks.map((chunk) => {
      return expo.sendPushNotificationsAsync(chunk);
    }),
  ).then((tickets) => tickets.flat());
};

// export const handleTickets = (tickets: ExpoPushTicket[]) => {
//   const successTickets = tickets.filter((ticket) => {
//     if (ticket.status === "error") {
//       console.error(
//         `There was an error sending a notification: ${ticket.message}`,
//         JSON.stringify(ticket.details),
//       );
//     }
//     return ticket.status === "ok";
//   }) as ExpoPushSuccessTicket[];
//   return successTickets.map((ticket) => ticket.id);
// };

type ErrorTicketHandlers = {
  onPushTicketError: (ticket: ExpoPushErrorReceipt) => void;
  onGetReceiptError: (error: Error) => void;
  onReceiptError: (receiptId: string, receipt: ExpoPushErrorReceipt) => void;
};
export const handleTickets = async (
  tickets: ExpoPushTicket[],
  { onPushTicketError, onReceiptError, onGetReceiptError }: ErrorTicketHandlers,
) => {
  const successTicketIds = (
    tickets.filter((ticket) => {
      if (ticket.status === "error") onPushTicketError(ticket);
      return ticket.status === "ok";
    }) as ExpoPushSuccessTicket[]
  ).map((ticket) => ticket.id);

  const receiptIdChunks =
    expo.chunkPushNotificationReceiptIds(successTicketIds);

  receiptIdChunks.forEach(async (chunk) => {
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

      Object.entries(receipts).forEach(([receiptId, receipt]) => {
        if (receipt.status === "ok") {
          return;
        }
        onReceiptError(receiptId, receipt);
      });
    } catch (error) {
      onGetReceiptError(error);
    }
  });
};
