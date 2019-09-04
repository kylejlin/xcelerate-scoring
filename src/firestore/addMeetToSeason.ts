import firebase from "../firebase";

import { MeetSummary } from "../types/misc";
import { RaceDivision, RaceDivisionUtil } from "../types/race";

const db = firebase.firestore();

export default function addMeetToSeason(
  meetName: string,
  seasonId: string,
  divisions: RaceDivision[]
): Promise<MeetSummary> {
  const meetRef = db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .doc();
  const batch = db.batch();
  batch.set(meetRef, {
    name: meetName,
    timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
  });
  divisions.forEach(division => {
    const raceId = RaceDivisionUtil.stringify(division);
    const raceRef = meetRef.collection("races").doc(raceId);
    batch.set(raceRef, {
      grade: division.grade,
      gender: division.gender,
      isLocked: false,
      numberOfActions: 0,
      athletesMostRecentlyActedUpon: [null, null, null, null],
    });
  });

  return batch
    .commit()
    .then(() => meetRef.get())
    .then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error(
          "Error calling addMeetToSeason: Somehow `then` got called indicating the write succeeded, but the meet does not exist."
        );
      } else {
        return { id: doc.id, name: meetName, timeCreated: data.timeCreated };
      }
    });
}
