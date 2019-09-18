import { Athlete, Gender } from "./athlete";

export function getOrderedTeams({
  minGrade,
  maxGrade,
  schools,
}: Teams): Team[] {
  const orderedSchools = schools.slice().sort();
  const divisions = getOrderedDivisions(minGrade, maxGrade);
  return orderedSchools.flatMap(school =>
    divisions.map(division => ({ school, ...division }))
  );
}

export function isAthetePartOfTeam(athlete: Athlete, team: Team): boolean {
  return (
    athlete.grade === team.grade &&
    athlete.gender === team.gender &&
    athlete.school === team.school
  );
}

export interface Division {
  grade: number;
  gender: Gender;
}

export interface Team extends Division {
  school: string;
}

export interface Teams {
  minGrade: number;
  maxGrade: number;
  schools: string[];
}

function getOrderedDivisions(min: number, max: number): Division[] {
  return inclusiveIntRange(min, max).flatMap(grade => [
    { grade, gender: Gender.Male },
    { grade, gender: Gender.Female },
  ]);
}

function inclusiveIntRange(min: number, max: number): number[] {
  const range = [];
  for (let i = min; i <= max; i++) {
    range.push(i);
  }
  return range;
}
