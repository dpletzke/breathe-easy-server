import { fetch } from "undici";

import type {
  Error1Response,
  Error2Response,
  StationResponse,
  StationsLookupResponse,
} from "./types.js";

type ResponseType =
  | StationResponse
  | StationsLookupResponse
  | Error1Response
  | Error2Response;

export function assertSuccess<T extends ResponseType>(
  response: ResponseType,
): asserts response is T {
  if (response.status === "error") {
    throw new Error(response.data);
  }
  if (response.data.hasOwnProperty("status")) {
    throw new Error((response as Error2Response).data.msg);
  }
}

const stationsApiBaseUrl = "https://api.waqi.info";

export const requestStation = async (
  stationId: string,
): Promise<StationResponse> => {
  const urlStationLookup = `${stationsApiBaseUrl}/feed/@${stationId}/?token=${process.env.AQI_API_TOKEN}`;

  const response = await fetch(urlStationLookup);
  const json = (await response.json()) as ResponseType;
  assertSuccess<StationResponse>(json);
  return json;
};
