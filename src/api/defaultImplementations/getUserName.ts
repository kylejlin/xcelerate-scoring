import firebase from "../../firebase";

import Option from "../../types/Option";
import { FullName } from "../../types/misc";

const db = firebase.firestore();

export default function getUserName(
  user: firebase.User
): Promise<Option<FullName>> {
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(snapshot => {
      const data = snapshot.data();
      if (data === undefined) {
        return Option.none();
      } else {
        return Option.some({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }
    });
}
