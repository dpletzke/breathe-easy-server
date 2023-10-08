import { Db as DbType } from "mongodb";

import { runNotifiers } from "./runNotifiers.js";

let timeInterval = process.env.TIME_INTERVAL
  ? parseInt(process.env.TIME_INTERVAL)
  : 1000 * 60 * 60; // 1 hour

export const startInterval = (interval: NodeJS.Timeout | null, db: DbType) => {
  console.log("timeInterval:", timeInterval);
  interval = setInterval(async () => {
    runNotifiers(db);
  }, timeInterval);
};
