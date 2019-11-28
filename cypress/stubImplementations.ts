import { Season } from "../src/types/misc";

import seasons from "./fixtures/seasons.json";

import fillTemplate from "./fillTemplate";

export function getGetArbitrarySeasons(
  userUid: string
): () => Promise<Season[]> {
  return function getArbitrarySeasons(): Promise<Season[]> {
    return Promise.resolve(fillTemplate(seasons, { userUid }));
  };
}
