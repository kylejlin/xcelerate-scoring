import firebase from "../firebase";
import { UserAccount } from "../types/misc";

const db = firebase.firestore();

export default function getSeasonOwnerAndAssistants(
  seasonId: string
): Promise<[UserAccount, UserAccount[]]> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to getSeasonAssistants of nonexistent season."
        );
      } else {
        const owner = getUser(data.ownerId);
        const assistants = Promise.all<UserAccount>(
          data.assistantIds.map(getUser)
        );
        return Promise.all([owner, assistants]);
      }
    });
}

function getUser(userId: string): Promise<UserAccount> {
  return db
    .collection("users")
    .doc(userId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error("Attempted to getUser of nonexistent user.");
      } else {
        return {
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
        };
      }
    });
}
