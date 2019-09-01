import firebase from "../firebase";

import getSeasonSummary from "./private/getSeasonSummary";
import { SeasonSummary } from "../types/misc";

const db = firebase.firestore();

export default function getUserSeasons(
  user: firebase.User
): Promise<SeasonSummary[]> {
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
      ownedSeasons.docs.concat(assistedSeasons.docs).map(getSeasonSummary)
  );
}
