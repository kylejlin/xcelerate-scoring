import firebase from "../../firebase";

import { User } from "..";

export default function onAuthStateChanged(
  callback: (user: User | null) => void
): firebase.Unsubscribe {
  return firebase.auth().onAuthStateChanged(callback);
}
