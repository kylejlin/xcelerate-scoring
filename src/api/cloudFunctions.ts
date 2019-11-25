import firebase from "../firebase";
import {
  CompressedHypotheticalAthlete,
  CompressedAthlete,
  SeasonSpec,
  Season,
} from "../types/misc";

const functions = firebase.functions();

type Callable<Args, ReturnType = any> = (
  data: Args
) => Promise<{ data: ReturnType }>;

export const createSeason: Callable<
  SeasonSpec,
  { season: Season }
> = functions.httpsCallable("createSeason");

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
