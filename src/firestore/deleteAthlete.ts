import firebase from "../firebase";
import { Athlete } from "../types/misc";

const db = firebase.firestore();

export default function deleteAthlete(
  seasonId: string,
  athlete: Athlete
): Promise<void> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .collection("athletes")
    .doc(athlete.id)
    .delete();
}
