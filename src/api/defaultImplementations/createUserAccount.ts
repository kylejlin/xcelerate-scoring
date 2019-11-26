import firebase from "../../firebase";

import { FullName } from "../../types/misc";

const db = firebase.firestore();

export default function createUserAccount(
  userUid: string,
  fullName: FullName
): Promise<void> {
  return db
    .collection("users")
    .doc(userUid)
    .set(fullName);
}
