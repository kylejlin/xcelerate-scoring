import firebase from "../../firebase";

import { MeetSummary } from "../../types/misc";

const db = firebase.firestore();

export default function getMeet(
  seasonId: string,
  meetId: string
): Promise<MeetSummary> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .doc(meetId)
    .get()
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Attempted to call getMeet with an invalid season id or meet id."
        );
      } else {
        return { id: doc.id, name: data.name, timeCreated: data.timeCreated };
      }
    });
}
