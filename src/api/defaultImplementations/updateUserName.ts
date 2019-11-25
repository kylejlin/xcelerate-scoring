import firebase from "../../firebase";

import { FullName } from "../../types/misc";

const db = firebase.firestore();

export default function updateUserName(
  user: firebase.User,
  fullName: FullName
): Promise<void> {
  return db
    .collection("users")
    .doc(user.uid)
    .update(fullName);
}
