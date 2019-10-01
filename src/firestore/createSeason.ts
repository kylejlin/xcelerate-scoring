import firebase from "../firebase";

import { UnidentifiedSeason, SeasonSummary } from "../types/misc";

const db = firebase.firestore();

export default function createSeason(
  user: firebase.User,
  spec: UnidentifiedSeason
): Promise<SeasonSummary> {
  const season = {
    ...spec,
    ownerId: user.uid,
    assistantIds: [],
    meets: [],
    athleteIdCounter: 0,
  };
  return db
    .collection("seasons")
    .add(season)
    .then(doc => ({ id: doc.id, name: spec.name }));
}
