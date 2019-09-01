import firebase from "../firebase";

const db = firebase.firestore();

export default function getSeasonGradeBounds(
  seasonId: string
): Promise<{ min: number; max: number }> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to getSeasonGradeBounds of nonexistent seasons."
        );
      } else {
        return { min: data.minGrade, max: data.maxGrade };
      }
    });
}
