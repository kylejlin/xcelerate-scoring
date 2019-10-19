import firebase from "../firebase";

import { Season } from "../types/misc";

const db = firebase.firestore();

export default function getUserSeasons(user: firebase.User): Promise<Season[]> {
  const ownedSeasons = db
    .collection("seasons")
    .where("ownerId", "==", user.uid)
    .get();
  const assistedSeasons = db
    .collection("seasons")
    .where("assistantIds", "array-contains", user.uid)
    .get();
  return Promise.all([ownedSeasons, assistedSeasons]).then(
    ([ownedSeasons, assistedSeasons]) =>
      ownedSeasons.docs.concat(assistedSeasons.docs).map(getSeason)
  );
}

function getSeason(doc: firebase.firestore.QueryDocumentSnapshot): Season {
  const {
    name,
    ownerId,
    assistantIds,
    minGrade,
    maxGrade,
    schools,
  } = doc.data();
  return {
    id: doc.id,
    name,
    ownerId,
    assistantIds,
    minGrade,
    maxGrade,
    schools,
  };
}
