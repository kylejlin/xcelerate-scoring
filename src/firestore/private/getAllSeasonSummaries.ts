import firebase from "../../firebase";

import getSeasonSummary from "./getSeasonSummary";
import { SeasonSummary } from "../../types/misc";

const db = firebase.firestore();

export default function getAllSeasonSummaries(): Promise<SeasonSummary[]> {
  return db
    .collection("seasons")
    .get()
    .then(snapshot => snapshot.docs.map(getSeasonSummary));
}
