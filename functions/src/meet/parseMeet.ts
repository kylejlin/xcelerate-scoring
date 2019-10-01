import * as admin from "firebase-admin";

import Option from "../types/Option";
import { Meet } from "./types";
import { isInt } from "../types/misc";
import parseFlattened2dArray from "../parseFlattened2dArray";

export default function parseMeet(
  data: admin.firestore.DocumentData
): Option<Meet> {
  const { payload } = data;
  if (Array.isArray(payload) && payload.every(isInt)) {
    const [minGrade, maxGrade, ...flattenedDivisionFinisherIds] = payload;
    if (minGrade > 0 && minGrade <= maxGrade) {
      return (parseFlattened2dArray(flattenedDivisionFinisherIds) as Option<
        number[][]
      >).map(divisionFinisherIds => ({
        minGrade,
        maxGrade,
        divisionFinisherIds,
      }));
    }
  }

  return Option.none();
}
