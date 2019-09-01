import firebase from "../firebase";

const db = firebase.firestore();

export default function doesUserAccountExist(
  user: firebase.User
): Promise<boolean> {
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(doc => doc.exists);
}
