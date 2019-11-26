import firebase from "../../firebase";

const db = firebase.firestore();

export default function doesUserAccountExist(
  userUid: string
): Promise<boolean> {
  return db
    .collection("users")
    .doc(userUid)
    .get()
    .then(doc => doc.exists);
}
