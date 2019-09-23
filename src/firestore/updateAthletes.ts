import { updateAthletes as updateFirestoreAthletes } from "./private/cloudFunctions";

import Option from "../types/Option";
import { Athlete, compressAthlete, Teams } from "../types/misc";

export default function updateAthletes(
  seasonId: string,
  athletes: Athlete[],
  teams: Teams
): Promise<void> {
  const compressedAthletes = Option.all(
    athletes.map(athlete => compressAthlete(athlete, teams))
  ).expect(
    "Attempted to addAthletesToSeason when one or more athletes had an invalid team."
  );
  return updateFirestoreAthletes({
    seasonId,
    athletes: compressedAthletes,
  }).then(() => {});
}
