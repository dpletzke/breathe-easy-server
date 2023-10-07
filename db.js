import { config } from "dotenv";
import { MongoClient } from "mongodb";

import expoNotifs from "./expoNotifs.js";

config();

const connectToCluster = async (uri) => {
  let mongoClient;

  try {
    mongoClient = new MongoClient(uri);
    console.log("Connecting to MongoDB Atlas cluster...");
    await mongoClient.connect();
    console.log("Successfully connected to MongoDB Atlas!");

    return mongoClient;
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
    process.exit();
  }
};

(async () => {
  const mongoClient = await connectToCluster(process.env.DB_URI);
  const db = mongoClient.db(process.env.MONGODB_DB_NAME);
  const customDataCollection = db.collection(
    process.env.MONGODB_USER_DATA_COLL,
  );
  const expoTokens = await customDataCollection
    .find({})
    .toArray()
    .then((users) => users.map((user) => user.expoPushToken));
  console.log(expoTokens);

  expoNotifs(expoTokens);
})();
