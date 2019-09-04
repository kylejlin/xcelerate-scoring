import firebase from "../firebase";
import {
  RaceDivision,
  RaceAction,
  RaceDivisionUtil,
  IndexedRaceAction,
} from "../types/race";

const db = firebase.firestore();

export default function appendAction(
  seasonId: string,
  meetId: string,
  division: RaceDivision,
  action: RaceAction
): Promise<void> {
  const raceId = RaceDivisionUtil.stringify(division);
  const raceRef = db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .doc(meetId)
    .collection("races")
    .doc(raceId);
  const actionListRef = raceRef.collection("actionLists").doc(action.athleteId);
  return db.runTransaction(transaction => {
    return transaction.get(raceRef).then(doc => {
      const data = doc.data();
      if (data === undefined) {
        throw new Error("Attempted to appendAction to nonexistent race.");
      } else {
        const { numberOfActions, athletesMostRecentlyActedUpon } = data;
        const newNumberOfActions = numberOfActions + 1;
        const newAthletesMostRecentlyActedUpon = [action.athleteId].concat(
          athletesMostRecentlyActedUpon.slice(0, 3)
        );
        return transaction.get(actionListRef).then(doc => {
          const data = doc.data();
          if (data === undefined) {
            transaction
              .set(actionListRef, {
                actions: [getFirestoreAction(action, numberOfActions)],
              })
              .update(raceRef, {
                numberOfActions: newNumberOfActions,
                athletesMostRecentlyActedUpon: newAthletesMostRecentlyActedUpon,
              });
          } else {
            const { actions } = data;
            const newActions = actions.concat([
              getFirestoreAction(action, numberOfActions),
            ]);
            transaction
              .set(actionListRef, { actions: newActions })
              .update(raceRef, {
                numberOfActions: newNumberOfActions,
                athletesMostRecentlyActedUpon: newAthletesMostRecentlyActedUpon,
              });
          }
        });
      }
    });
  });
}

function getFirestoreAction(
  action: RaceAction,
  index: number
): Omit<IndexedRaceAction, "athleteId"> {
  const firestoreAction = { ...action, index };
  delete firestoreAction.athleteId;
  return firestoreAction;
}
