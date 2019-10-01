import firebase from "../../firebase";
import {
  CompressedHypotheticalAthlete,
  CompressedAthlete,
} from "../../types/misc";

const functions = firebase.functions();

type Callable<Data> = (
  data: Data
) => Promise<firebase.functions.HttpsCallableResult>;

export const addAthletes: Callable<{
  athletes: CompressedHypotheticalAthlete[];
  seasonId: string;
}> = functions.httpsCallable("addAthletes");

export const updateAthletes: Callable<{
  seasonId: string;
  athletes: CompressedAthlete[];
}> = functions.httpsCallable("updateAthletes");

export const deleteAthletes: Callable<{
  seasonId: string;
  athleteIds: number[];
}> = functions.httpsCallable("deleteAthletes");

export const createMeet: Callable<{
  seasonId: string;
  meetName: string;
}> = functions.httpsCallable("createMeet");

export const applyRaceActions: Callable<{
  seasonId: string;
  meetId: string;
  actions: number[];
}> = functions.httpsCallable("applyRaceActions");

// @ts-ignore
window.applyRaceActions = applyRaceActions;
