import { Athlete } from "../types/athlete";
import {
  TeamsRecipe,
  getOrderedTeams,
  isAthetePartOfTeam,
} from "../types/team";

export default function buildAggregatePayload(
  athletes: Athlete[],
  teams: TeamsRecipe
): (string | number)[] {
  const { minGrade, maxGrade, schools } = teams;
  const payload = [minGrade, maxGrade, schools.length, ...schools];
  const orderedTeams = getOrderedTeams(teams);
  orderedTeams.forEach(team => {
    const athletesPartOfTeam = athletes.filter(athlete =>
      isAthetePartOfTeam(athlete, team)
    );
    payload.push(athletesPartOfTeam.length * 3);
    athletesPartOfTeam.forEach(athlete => {
      payload.push(athlete.id, athlete.firstName, athlete.lastName);
    });
  });
  return payload;
}
