import firebase from "../firebase";

import { Athlete } from "../types/misc";

const db = firebase.firestore();

export default function updateAthlete(
  seasonId: string,
  athlete: Athlete
): Promise<void> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .collection("athletes")
    .doc(athlete.id)
    .set({
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      school: athlete.school,
      grade: athlete.grade,
      gender: athlete.gender,
    });
}
