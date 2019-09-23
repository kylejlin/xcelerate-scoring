import firebase from "../../firebase";
import { CompressedHypotheticalAthlete } from "../../types/misc";

const functions = firebase.functions();

type Callable<Data> = (
  data: Data
) => Promise<firebase.functions.HttpsCallableResult>;

export const addAthletes: Callable<{
  athletes: CompressedHypotheticalAthlete[];
  seasonId: string;
}> = functions.httpsCallable("addAthletes");

export const deleteAthletes: Callable<{
  seasonId: string;
  athleteIds: number[];
}> = functions.httpsCallable("deleteAthletes");

export const createMeet: Callable<{
  seasonId: string;
  meetName: string;
}> = functions.httpsCallable("createMeet");

export const updateMeet: Callable<{
  seasonId: string;
  meetId: string;
  instructions: number[];
}> = functions.httpsCallable("updateMeet");
