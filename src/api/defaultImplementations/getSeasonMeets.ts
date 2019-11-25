import firebase from "../../firebase";

import { MeetSummary } from "../../types/misc";

const db = firebase.firestore();

export default function getSeasonMeets(
  seasonId: string
): Promise<MeetSummary[]> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .orderBy("timeCreated")
    .get()
    .then(query => query.docs.map(getMeet));
}

function getMeet(doc: firebase.firestore.QueryDocumentSnapshot): MeetSummary {
  const data = doc.data();
  return { id: doc.id, name: data.name, timeCreated: data.timeCreated };
}
