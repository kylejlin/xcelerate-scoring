import { createSeason as createSeasonInFirestore } from "../cloudFunctions";

import { SeasonSpec, Season } from "../../types/misc";

export default function createSeason(season: SeasonSpec): Promise<Season> {
  return createSeasonInFirestore(season).then(res => res.data.season);
}
