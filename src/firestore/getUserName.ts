import firebase from "../firebase";

import { FullName } from "../types/misc";

const db = firebase.firestore();

export default function getUserName(user: firebase.User): Promise<FullName> {
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(snapshot => {
      const data = snapshot.data();
      if (data === undefined) {
        throw new Error("Attempted to get user profile of nonexistent user.");
      } else {
        return {
          firstName: data.firstName,
          lastName: data.lastName,
        };
      }
    });
}
