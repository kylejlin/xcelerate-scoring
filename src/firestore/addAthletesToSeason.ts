import firebase from "../firebase";
import {
  HypotheticalAthlete,
  compressHypotheticalAthlete,
  Teams,
} from "../types/misc";
import Option from "../types/Option";

const functions = firebase.functions();
const addAthletes = functions.httpsCallable("addAthletes");

export default function addAthletesToSeason(
  athletes: HypotheticalAthlete[],
  seasonId: string,
  teams: Teams
): Promise<void> {
  if (athletes.length > 0) {
    const compressedAthletes = Option.all(
      athletes.map(athlete => compressHypotheticalAthlete(athlete, teams))
    ).expect(
      "Attempted to addAthletesToSeason when one or more athletes had an invalid team."
    );
    return addAthletes({ athletes: compressedAthletes, seasonId }).then(
      () => {}
    );
  } else {
    return Promise.resolve();
  }
}
