import { updateAthletes as updateFirestoreAthletes } from "../cloudFunctions";

import Option from "../../types/Option";
import { Athlete, compressAthlete, TeamsRecipe } from "../../types/misc";

export default function updateAthletes(
  seasonId: string,
  athletes: Athlete[],
  teams: TeamsRecipe
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
