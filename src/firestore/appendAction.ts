import { applyRaceActions } from "./private/cloudFunctions";
import { RaceAction } from "../types/race";
import compressActions from "./private/compressActions";

export default function appendAction(
  seasonId: string,
  meetId: string,
  action: RaceAction
): Promise<void> {
  return applyRaceActions({
    seasonId,
    meetId,
    actions: compressActions([action]),
  }).then(() => {});
}
