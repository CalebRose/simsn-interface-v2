import { getApp, getApps, initializeApp } from "firebase/app";
import { fbaUrl } from "./_constants/urls";
import { GetCall } from "./_helper/fetchHelper";
import { getFirestore } from "firebase/firestore";

interface firebaseConfig {
  Key: string;
  Domain: string;
  DBUrl: string;
  ProjectID: string;
  Bucket: string;
  SenderID: string;
  AppID: string;
  MeasurementID: string;
  User: string;
  UserKey: string;
}

async function loadConfig() {
  const res = (await GetCall(`${fbaUrl}admin/fire/it/up`)) as firebaseConfig;
  return {
    apiKey: res.Key,
    authDomain: res.Domain,
    databaseURL: res.DBUrl,
    projectId: res.ProjectID,
    storageBucket: res.Bucket,
    messagingSenderId: res.SenderID,
    appId: res.AppID,
    measurementId: res.MeasurementID,
    simFBAKey: res.User,
    simFBAUser: res.UserKey,
  };
}

export const fireBaseAppPromise = loadConfig().then((cfg) => {
  if (!getApps().length) return initializeApp(cfg);
  return getApp();
});

export async function getFirestoreInstance() {
  const app = await fireBaseAppPromise;
  return getFirestore(app);
}
