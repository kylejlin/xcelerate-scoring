import { AthleteRow, Gender } from "./types/misc";
import Option from "./types/Option";

export default function parseSpreadsheetData(data: string): AthleteRow[] {
  const rowsOfTabSeparatedValues = data
    .split("\n")
    .filter(row => !/^\s*$/.test(row));
  return rowsOfTabSeparatedValues.map(row => {
    const values = row.split("\t");
    const [firstName, lastName] = getName(values);
    const grade = getGrade(values);
    const gender = getGender(values);
    return { firstName, lastName, grade, gender };
  });
}

function getName(values: string[]): [string, string] {
  const names = values.filter(isName);
  return [names[0] || "", names[1] || ""];
}

function isName(string: string): boolean {
  return isNotNumber(string) && isNotGender(string);
}

function isNotNumber(string: string): boolean {
  return isNaN(parseInt(string.trim(), 10));
}

function isNotGender(string: string): boolean {
  return !/^[mbfg]$/i.test(string);
}

function getGrade(values: string[]): Option<number> {
  const gradeOrUndefined = values
    .map(value => parseInt(value.trim(), 10))
    .find(value => !isNaN(value));
  return gradeOrUndefined === undefined
    ? Option.none()
    : Option.some(gradeOrUndefined);
}

function getGender(values: string[]): Option<Gender> {
  const someGenderOrUndefined = values
    .map(toGender)
    .find(option => option.isSome());
  return someGenderOrUndefined || Option.none();
}

function toGender(string: string): Option<Gender> {
  const lowercase = string.toLowerCase();
  if (lowercase === "m" || lowercase === "b") {
    return Option.some(Gender.Male);
  } else if (lowercase === "f" || lowercase === "g") {
    return Option.some(Gender.Female);
  } else {
    return Option.none();
  }
}
