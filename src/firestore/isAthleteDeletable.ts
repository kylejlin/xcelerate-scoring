import firebase from "../firebase";
import { Athlete } from "../types/misc";
import { RaceAction, RaceActionKind } from "../types/race";

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
  return meet
    .collection("races")
    .get()
    .then(raceCollection =>
      didAthleteFinishInAnyRace(
        athlete,
        raceCollection.docs.map(doc => doc.ref)
      )
    );
}

function didAthleteFinishInAnyRace(
  athlete: Athlete,
  races: firebase.firestore.DocumentReference[]
): Promise<boolean> {
  return Promise.all(
    races.map(race => didAthleteFinishInRace(athlete, race))
  ).then(areAnyTrue);
}

function didAthleteFinishInRace(
  athlete: Athlete,
  race: firebase.firestore.DocumentReference
): Promise<boolean> {
  return race
    .collection("actionLists")
    .doc(athlete.id)
    .get()
    .then(athleteActionList => {
      const data = athleteActionList.data();
      if (data === undefined) {
        return false;
      } else {
        const mostRecentAction = data.actions[
          data.actions.length - 1
        ] as RaceAction;
        return mostRecentAction.kind !== RaceActionKind.Delete;
      }
    });
}

function areAnyTrue(arr: boolean[]): boolean {
  return arr.some(x => x);
}
