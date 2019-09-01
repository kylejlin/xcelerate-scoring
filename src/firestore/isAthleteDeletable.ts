import firebase from "../firebase";
import { Athlete } from "../types/misc";

const db = firebase.firestore();

export default function isAthleteDeletable(
  seasonId: string,
  athlete: Athlete
): Promise<boolean> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to call isAthleteDeletable on a nonexistent season."
        );
      } else {
        // TODO Meets
        console.log("TODO Meets");
        return true;
      }
    });
}
