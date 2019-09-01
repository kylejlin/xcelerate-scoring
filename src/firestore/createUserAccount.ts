import firebase from "../firebase";

import { FullName } from "../types/misc";

const db = firebase.firestore();

export default function createUserAccount(
  user: firebase.User,
  fullName: FullName
): Promise<void> {
  return db
    .collection("users")
    .doc(user.uid)
    .set({ ...fullName, seasons: [] });
}
