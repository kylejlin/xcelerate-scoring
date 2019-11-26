import firebase from "../../firebase";

const db = firebase.firestore();

export default function getUserSeasonPermissions(
  userUid: string,
  seasonId: string
): Promise<{ isOwner: boolean; hasWriteAccess: boolean }> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to call getUserSeasonPermissions on a nonexistent season."
        );
      } else {
        const isOwner = data.ownerId === userUid;
        const hasWriteAccess =
          isOwner ||
          (Array.isArray(data.assistantIds) &&
            data.assistantIds.includes(userUid));
        return { isOwner, hasWriteAccess };
      }
    });
}
