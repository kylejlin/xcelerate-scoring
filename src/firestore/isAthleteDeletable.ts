import firebase from "../firebase";
import { Athlete } from "../types/misc";
import { RaceDivisionUtil, RaceAction, RaceActionKind } from "../types/race";

const db = firebase.firestore();

export default function isAthleteDeletable(
  seasonId: string,
  athlete: Athlete
): Promise<boolean> {
  const meetDocs = db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .get()
    .then(meetCollection => meetCollection.docs);
  return didAthleteFinishAtAnyMeet(athlete, meetDocs).then(
    didFinishAtAnyMeet => !didFinishAtAnyMeet
  );
}

function didAthleteFinishAtAnyMeet(
  athlete: Athlete,
  meets: Promise<firebase.firestore.QueryDocumentSnapshot[]>
): Promise<boolean> {
  return meets.then(meets =>
    Promise.all(
      meets.map(meet => didAthleteFinishAtMeet(athlete, meet.ref))
    ).then(areAnyTrue)
  );
}

function didAthleteFinishAtMeet(
  athlete: Athlete,
  meet: firebase.firestore.DocumentReference
): Promise<boolean> {
  const divisionId = RaceDivisionUtil.stringify(
    RaceDivisionUtil.getAthleteDivision(athlete)
  );
  return meet
    .collection("races")
    .doc(divisionId)
    .get()
    .then(division =>
      division.exists
        ? division.ref
            .collection("actionLists")
            .doc(athlete.id)
            .get()
            .then(athleteActionListDoc => {
              const data = athleteActionListDoc.data();
              if (data === undefined) {
                return false;
              } else {
                const mostRecentAction = data.actions[
                  data.actions.length - 1
                ] as RaceAction;
                return mostRecentAction.kind !== RaceActionKind.Delete;
              }
            })
        : false
    );
}

function areAnyTrue(arr: boolean[]): boolean {
  return arr.some(x => x);
}
