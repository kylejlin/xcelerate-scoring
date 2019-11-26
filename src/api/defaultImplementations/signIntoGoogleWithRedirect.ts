import firebase from "../../firebase";

export default function signIntoGoogleWithRedirect(): void {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
}
