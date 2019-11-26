import firebase from "../../firebase";

import { FullName } from "../../types/misc";

const db = firebase.firestore();

export default function updateUserName(
  userUid: string,
  fullName: FullName
): Promise<void> {
  return db
    .collection("users")
    .doc(userUid)
    .update(fullName);
}
