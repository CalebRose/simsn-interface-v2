const fbaLocal = "http://localhost:5001/api/";
const fbaApiURL = "https://simfba.azurewebsites.net/api/";
export const fbaUrl = fbaApiURL;

export const imagekitAuthUrl = `${fbaApiURL}imagekit/auth/`;

const localWSURL = "ws://localhost:5001/ws";
const FBAWSURL = "wss://simfba.azurewebsites.net/ws";
export const fba_ws = FBAWSURL;

const localBBAWSURL = "ws://localhost:8081/ws";
const BBAWSURL = "wss://simnba.azurewebsites.net/ws";
export const bba_ws = BBAWSURL;

const bbaLocal = "http://localhost:8081/api/";
const bbaAPIUrl = "https://simnba.azurewebsites.net/api/";
export const bbaUrl = bbaAPIUrl;

const hckLocal = "http://localhost:8080/api/";
const hckApiURL =
  "https://simhck-hqd2bme9gse5d7g9.westus-01.azurewebsites.net/api/";
const localHckWSUrl = "ws://localhost:8080/ws";
const HCKWSURL = "wss://simhck-hqd2bme9gse5d7g9.westus-01.azurewebsites.net/ws";

// SWAPPED TO PRODUCTION FOR REAL WORLD TEST:
export const hckUrl = hckApiURL;
export const hck_ws = HCKWSURL;

const localBASEBALL = "https://localhost:6001/api/";
const baseballApiURL =
  "https://simbaseballapi-production.up.railway.app/api/v1/";
export const baseballUrl = baseballApiURL;
const localBASEBALLWS = "ws://localhost:6001/ws";
const baseballWSURL = "wss://simbaseballapi-production.up.railway.app/ws";
export const baseball_ws = baseballWSURL;
