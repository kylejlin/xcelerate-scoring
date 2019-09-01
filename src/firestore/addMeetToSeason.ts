import firebase from "../firebase";

import { MeetSummary } from "../types/misc";

const db = firebase.firestore();

export default function addMeetToSeason(
  meetName: string,
  seasonId: string
): Promise<MeetSummary> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .add({
      name: meetName,
      timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(doc => doc.get())
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Error calling addMeetToSeason: Some how `then` got called indicating the write succeeded, but the meet does not exist."
        );
      } else {
        return { id: doc.id, name: meetName, timeCreated: data.timeCreated };
      }
    });
}
