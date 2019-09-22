import Option from "./types/Option";
import { isNonNegativeInt } from "./types/misc";

export default function parseFlattened2dArray(
  arr: unknown[]
): Option<unknown[][]> {
  const parsed = [];
  let cursor = 0;
  while (cursor < arr.length) {
    const subArrLen = arr[cursor];
    if (!isNonNegativeInt(subArrLen)) {
      return Option.none();
    }
    cursor++;
    if (cursor + subArrLen > arr.length) {
      return Option.none();
    }
    parsed.push(arr.slice(cursor, cursor + subArrLen));
    cursor += subArrLen;
  }
  return Option.some(parsed);
}
