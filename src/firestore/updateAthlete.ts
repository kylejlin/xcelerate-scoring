import firebase from "../firebase";

import { Athlete } from "../types/misc";

const functions = firebase.functions();

export default function updateAthlete(
  seasonId: string,
  athlete: Athlete
): Promise<void> {
  return functions
    .httpsCallable("updateAthlete")({ athlete, seasonId })
    .then(() => {});
}
