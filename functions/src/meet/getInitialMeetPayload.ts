import { DivisionsRecipe, getOrderedDivisions } from "../types/team";

export default function getInitialMeetPayload(
  divisionsRecipe: DivisionsRecipe
): number[] {
  const numberOfDivisions = getOrderedDivisions(divisionsRecipe).length;
  const { minGrade, maxGrade } = divisionsRecipe;
  return [minGrade, maxGrade].concat(new Array(numberOfDivisions).fill(0));
}
