import firebase from "../firebase";

import { Races, Race, IndexedRaceAction } from "../types/race";

const db = firebase.firestore();

export default function getMeetRaces(
  seasonId: string,
  meetId: string
): Promise<Races> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .doc(meetId)
    .collection("races")
    .get()
    .then(raceCollection => {
      const raceArray = Promise.all(
        raceCollection.docs.map(raceDoc => {
          const raceData = raceDoc.data();
          const actionLists = raceDoc.ref.collection("actionLists").get();
          return actionLists.then(actionListCollection => {
            const actions = actionListCollection.docs.flatMap(getActions);
            return new Race(raceData, actions, raceDoc.ref);
          });
        })
      );
      return raceArray.then(raceArray => {
        const races = new Races();
        raceArray.forEach(race => {
          races.updateRace(race);
        });
        return races;
      });
    });
}

function getActions(
  doc: firebase.firestore.QueryDocumentSnapshot
): IndexedRaceAction[] {
  const { actions } = doc.data();
  return actions.map((action: Omit<IndexedRaceAction, "athleteId">) => ({
    athleteId: doc.id,
    ...action,
  }));
}
