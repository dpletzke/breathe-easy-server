import {
  Expo,
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
      onGetReceiptError(error as Error);
    }
  });
};
