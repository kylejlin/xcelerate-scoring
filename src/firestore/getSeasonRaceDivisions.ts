import firebase from "../firebase";

import { RaceDivisions } from "../types/misc";

const db = firebase.firestore();

export default function getSeasonRaceDivisions(
  seasonId: string
): Promise<RaceDivisions> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to getSeasonRaceDivisions of nonexistent season."
        );
      } else {
        return {
          minGrade: data.minGrade,
          maxGrade: data.maxGrade,
          schools: data.schools,
        };
      }
    });
}
