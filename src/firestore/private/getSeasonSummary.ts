import firebase from "../../firebase";

import { SeasonSummary } from "../../types/misc";

export default function getSeasonSummary(
  doc: firebase.firestore.QueryDocumentSnapshot
): SeasonSummary {
  return {
    id: doc.id,
    name: doc.data().name,
  };
}
