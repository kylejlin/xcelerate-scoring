import firebase from "../../firebase";

export default function onAuthStateChanged(
  callback: (user: firebase.User | null) => void
): firebase.Unsubscribe {
  return firebase.auth().onAuthStateChanged(callback);
}
