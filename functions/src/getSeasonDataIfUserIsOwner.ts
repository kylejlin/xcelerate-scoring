import * as admin from "firebase-admin";
import { HttpsError } from "firebase-functions/lib/providers/https";

export default function getSeasonDataIfUserIsOwner(
  seasonRef: FirebaseFirestore.DocumentReference,
  uid: string,
  transaction: admin.firestore.Transaction
): Promise<admin.firestore.DocumentData> {
  return transaction.get(seasonRef).then(doc => {
    const data = doc.data();
    if (data === undefined) {
      const seasonId = seasonRef.id;
      throw new HttpsError(
        "invalid-argument",
        "Invalid season id: " + seasonId
      );
    } else {
      const { ownerId } = data;
      if (ownerId === uid) {
        return data;
      } else {
        throw new HttpsError(
          "permission-denied",
          "You are not the owner of this season."
        );
      }
    }
  });
}
