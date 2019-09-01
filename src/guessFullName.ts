import { FullName } from "./types/misc";

export default function guessFullName(displayName: string): FullName {
  const firstName = displayName.split(" ")[0] || DEFAULT_FIRST_NAME;
  const lastName = displayName.split(" ")[1] || DEFAULT_LAST_NAME;
  return { firstName, lastName };
}

const DEFAULT_FIRST_NAME = "FirstName";
const DEFAULT_LAST_NAME = "LastName";
