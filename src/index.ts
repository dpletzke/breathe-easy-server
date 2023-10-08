import express from "express";

import { connectToDatabase } from "./db.js";
import { runNotifiers } from "./runNotifiers.js";
import { startInterval } from "./serviceInterval.js";

const app = express();

let interval: NodeJS.Timeout | null = null;
const db = await connectToDatabase();

runNotifiers(db);

app.post("/stop", (req, res) => {
  if (!interval) {
    console.log("::::Service already stopped");
    res.send("Service already stopped");
    return;
  }
  clearInterval(interval);
  res.send("Service stopped");
});

app.post("/restart", (req, res) => {
  if (interval) {
    console.log("::::Service stopped");
    clearInterval(interval);
  }
  runNotifiers(db);

  startInterval(interval, db);
  console.log("Service restarted");
  res.send("Service restarted");
});

app.post("/start", (req, res) => {
  startInterval(interval, db);
  console.log("Service started");
  res.send("Service started");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

process.on("exit", () => {
  if (interval) clearInterval(interval);
});
