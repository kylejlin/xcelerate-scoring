import firebase from "../../firebase";

export default function signIntoGoogleWithRedirect() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
}
