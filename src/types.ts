export type Error1Response = {
  status: "error";
  data: string;
};

export type Error2Response = {
  status: "ok";
  data: {
    status: "error";
    msg: string;
  };
};

export type StationLookup = {
  uid: number;
  aqi: number;
  lat: number;
  lon: number;
  station: {
    name: string;
    time: string;
  };
};

export type StationsLookupResponse = {
  status: "ok";
  data: StationLookup[];
};

type StationAttribution = {
  url: string;
  name: string;
  station?: string;
  logo?: string;
};

type StationCity = {
  geo: [number, number];
  name: string;
  url: string;
  location: string;
};

type StationTime = {
  s: string;
  tz: string;
  v: number;
  iso: string;
};
/*
pm25: "PM<sub>2.5</sub>",
pm10: "PM<sub>10</sub>",
o3: "Ozone",
no2: "Nitrogen Dioxide",
so2: "Sulphur Dioxide",
co: "Carbon Monoxyde",
t: "Temperature",
w: "Wind",
r: "Rain (precipitation)",
h: "Relative Humidity",
d: "Dew",
p: "Atmostpheric Pressure",
*/

type Value = {
  v: number;
};

export type QualityType = {
  pm25?: Value;
  pm10?: Value;
  o3?: Value;
  no2?: Value;
  so2?: Value;
  co?: Value;
  d?: Value;
  dew?: Value;
  h?: Value;
  p?: Value;
  t?: Value;
  w?: Value;
};

export type StationResponse = {
  status: "ok";
  data: {
    aqi: "-" | number;
    idx: number;
    attributions: StationAttribution[] | [];
    city: StationCity;
    dominentpol: string;
    iaqi: QualityType;
    time: StationTime;
  };
};

export type NotifierType = {
  _id: string;
  owner_id: string;
  stationId: string;
  threshold: number;
};

export type StationType = {
  _id: string;
  stationId: string;
  name: string;
  shortName: string;
  aqi: number;
  lastUpdated: string;
};

export type UserDataType = {
  _id: string;
  user_id: string;
  expoPushToken: string;
};
