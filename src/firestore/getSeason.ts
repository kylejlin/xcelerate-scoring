import firebase from "../firebase";
import { Season } from "../types/misc";

const db = firebase.firestore();

export default function getSeason(seasonId: string): Promise<Season> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to call getSeason with in an invalid season id."
        );
      } else {
        return {
          id: doc.id,
          name: data.name,
          minGrade: data.minGrade,
          maxGrade: data.maxGrade,
          schools: data.schools,
        };
      }
    });
}
