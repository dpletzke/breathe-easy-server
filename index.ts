import express from "express";

import { connectToDatabase } from "./db";
import { startInterval } from "./serviceInterval";

const app = express();

let interval: NodeJS.Timeout;
const db = await connectToDatabase();

app.post("/stop", (req, res) => {
  clearInterval(interval);
  res.send("Service stopped");
});

app.post("/restart", (req, res) => {
  clearInterval(interval);
  startInterval(interval, db);
  res.send("Service started");
});

app.post("/start", (req, res) => {
  startInterval(interval, db);
  res.send("Service started");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

process.on("exit", (code) => {
  clearInterval(interval);
});
