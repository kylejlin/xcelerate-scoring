import firebase from "../src/firebase";

const functions = firebase.functions();

export default function deleteSeason(seasonId: string): Promise<void> {
  return functions
    .httpsCallable("deleteTestSeason")({ seasonId })
    .then(() => {});
}
