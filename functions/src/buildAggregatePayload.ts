import { Athlete } from "./types/athlete";
import { Teams, getOrderedTeams, isAthetePartOfTeam } from "./types/team";

export default function buildAggregatePayload(
  athletes: Athlete[],
  teams: Teams
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
      payload.push(
        parseInt(athlete.id, 10),
        athlete.firstName,
        athlete.lastName
      );
    });
  });
  return payload;
}
