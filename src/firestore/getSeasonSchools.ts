import firebase from "../firebase";

const db = firebase.firestore();

export default function getSeasonSchools(seasonId: string): Promise<string[]> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error("Attempted to getSeasonSchools of nonexistent season.");
      } else {
        return data.schools;
      }
    });
}
