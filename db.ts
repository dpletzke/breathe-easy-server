import { config } from "dotenv";
import { Db as DbType, MongoClient } from "mongodb";

import { requestStation } from "./apiUtils";
import { StationType, UserDataType } from "./types";

config();

export const connectToDatabase = async () => {
  let mongoClient: MongoClient;

  try {
    if (!process.env.DB_URI) {
      throw new Error("DB_URI not found");
    }
    mongoClient = new MongoClient(process.env.DB_URI);
    console.log("Connecting to MongoDB Atlas cluster...");
    await mongoClient.connect();
    console.log("Successfully connected to MongoDB Atlas!");

    return mongoClient.db(process.env.MONGODB_DB_NAME);
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
    process.exit();
  }
};

export const upsertStation = (db: DbType, station: Partial<StationType>) => {
  const filter = { stationId: station.stationId };
  const update = {
    $set: {
      aqi: station.aqi,
      lastUpdated: station.lastUpdated,
      name: station.name,
      shortName: station.shortName,
    },
  };
  const options = { upsert: true };
  return db.collection("Station").updateOne(filter, update, options);
};

export const getUserData = (db: DbType, user_id: string) => {
  const filter = { user_id };
  return db.collection<UserDataType>("custom-user-data").findOne(filter);
};

export const requestStationAndUpsert = async (
  db: DbType,
  stationId: string,
) => {
  const stationResponse = await requestStation(stationId);
  const dataToUpsert = {
    stationId,
    aqi:stationResponse.data.aqi === "-" ? 0 : stationResponse.data.aqi;,
    lastUpdated: stationResponse.data.time.iso,
    name: stationResponse.data.city.name,
    shortName: stationResponse.data.city.name.split(",")[0],
  }
  const upsertStationResponse = await upsertStation(db, dataToUpsert);
  return { ...dataToUpsert, upsertStationResponse };
};
