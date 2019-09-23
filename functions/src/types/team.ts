import { Athlete, Gender } from "../athlete/types";

export function getOrderedTeams(teamsRecipe: TeamsRecipe): Team[] {
  const orderedSchools = teamsRecipe.schools.slice().sort();
  const divisions = getOrderedDivisions(teamsRecipe);
  return orderedSchools.flatMap(school =>
    divisions.map(division => ({ school, ...division }))
  );
}

export function getOrderedDivisions({
  minGrade,
  maxGrade,
}: DivisionsRecipe): Division[] {
  return inclusiveIntRange(minGrade, maxGrade).flatMap(grade => [
    { grade, gender: Gender.Male },
    { grade, gender: Gender.Female },
  ]);
}

export function isAthetePartOfTeam(athlete: Athlete, team: Team): boolean {
  return (
    athlete.grade === team.grade &&
    athlete.gender === team.gender &&
    athlete.school === team.school
  );
}

export function isAthleteInDivision(
  athlete: Athlete,
  division: Division
): boolean {
  return athlete.grade === division.grade && athlete.gender === division.gender;
}

export interface Division {
  grade: number;
  gender: Gender;
}

export interface DivisionsRecipe {
  minGrade: number;
  maxGrade: number;
}

export interface Team extends Division {
  school: string;
}

export interface TeamsRecipe {
  minGrade: number;
  maxGrade: number;
  schools: string[];
}

function inclusiveIntRange(min: number, max: number): number[] {
  const range = [];
  for (let i = min; i <= max; i++) {
    range.push(i);
  }
  return range;
}
