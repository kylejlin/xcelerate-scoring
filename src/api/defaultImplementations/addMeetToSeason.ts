import { createMeet } from "../cloudFunctions";

import { MeetSummary } from "../../types/misc";

export default function addMeetToSeason(
  meetName: string,
  seasonId: string
): Promise<MeetSummary> {
  return createMeet({ seasonId, meetName }).then(result => ({
    id: result.data.id,
    name: meetName,
    timeCreated: new Date(result.data.timeCreated),
  }));
}
