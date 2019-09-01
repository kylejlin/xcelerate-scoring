import firebase from "../firebase";

const db = firebase.firestore();

export default function doesUserHaveWriteAccessToSeason(
  user: firebase.User,
  seasonId: string
): Promise<boolean> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to call doesUserHaveWriteAccessToSeason on a nonexistent season."
        );
      } else {
        return (
          data.ownerId === user.uid ||
          (Array.isArray(data.assistantIds) &&
            data.assistantIds.includes(user.uid))
        );
      }
    });
}
