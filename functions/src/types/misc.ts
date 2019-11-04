export function isObject(x: unknown): x is UnknownObject {
  return "object" === typeof x && x !== null;
}

export type UnknownObject = { [key: string]: unknown };

export function isPositiveInt(n: unknown): n is number {
  return isInt(n) && n > 0;
}

export function isNonNegativeInt(n: unknown): n is number {
  return isInt(n) && n >= 0;
}

export function isInt(n: unknown): n is number {
  return n === parseInt("" + n, 10);
}

export interface SeasonSpec {
  name: string;
  minGrade: number;
  maxGrade: number;
  schools: string[];
}

export interface Season extends SeasonSpec {
  id: string;
  ownerId: string;
  assistantIds: string[];
}

export function isValidSeasonSpec(data: unknown): data is SeasonSpec {
  if (isObject(data)) {
    const { name, minGrade, maxGrade, schools } = data;
    return (
      "string" === typeof name &&
      !/^\s*$/.test(name) &&
      isPositiveInt(minGrade) &&
      isPositiveInt(maxGrade) &&
      minGrade <= maxGrade &&
      Array.isArray(schools) &&
      schools.every(s => "string" === typeof s && s != "") &&
      schools.length === new Set(schools).size &&
      schools.length > 0
    );
  }
  return false;
}
