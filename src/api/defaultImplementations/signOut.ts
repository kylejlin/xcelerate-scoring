import firebase from "../../firebase";

export default function signOut(): Promise<void> {
  return firebase.auth().signOut();
}
