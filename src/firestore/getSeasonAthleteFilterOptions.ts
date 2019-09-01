import firebase from "../firebase";

import { AthleteFilterOptions } from "../types/misc";

const db = firebase.firestore();

export default function getSeasonAthleteFilterOptions(
  seasonId: string
): Promise<AthleteFilterOptions> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to getSeasonAthleteFilterOptions of nonexistent season."
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
