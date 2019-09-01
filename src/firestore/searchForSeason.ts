import stringSimilarity from "string-similarity";

import getAllSeasonSummaries from "./private/getAllSeasonSummaries";
import { SeasonSummary } from "../types/misc";

const { compareTwoStrings } = stringSimilarity;

export default function searchForSeason(
  query: string
): Promise<SeasonSummary[]> {
  return getAllSeasonSummaries().then(summaries =>
    sortAndFilterSummaries(query, summaries)
  );
}

function sortAndFilterSummaries(
  query: string,
  summaries: SeasonSummary[]
): SeasonSummary[] {
  const lowerCaseQuery = query.toLowerCase();
  const ratedSummaries = summaries.map(summary => ({
    summary,
    similarity: compareTwoStrings(lowerCaseQuery, summary.name.toLowerCase()),
  }));
  return ratedSummaries
    .sort((a, b) => b.similarity - a.similarity)
    .filter(rs => rs.similarity >= CUTOFF)
    .map(rs => rs.summary);
}

const CUTOFF = 0.1;
