import firebase from "../firebase";

import { Athlete } from "../types/misc";

const db = firebase.firestore();

export default function getSeasonAthletes(
  seasonId: string
): Promise<Athlete[]> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .collection("athletes")
    .orderBy("firstName")
    .get()
    .then(query => query.docs.map(getAthlete));
}

function getAthlete(doc: firebase.firestore.QueryDocumentSnapshot): Athlete {
  const data = doc.data();
  return {
    id: doc.id,
    firstName: data.firstName,
    lastName: data.lastName,
    grade: data.grade,
    gender: data.gender,
    school: data.school,
  };
}
