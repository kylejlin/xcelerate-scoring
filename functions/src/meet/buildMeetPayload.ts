import { Meet } from "./types";

export default function buildMeetPayload(meet: Meet): number[] {
  const { minGrade, maxGrade } = meet;
  const payload = [minGrade, maxGrade];

  meet.divisionFinisherIds.forEach(finisherIds => {
    payload.push(finisherIds.length);
    payload.push(...finisherIds);
  });

  return payload;
}
