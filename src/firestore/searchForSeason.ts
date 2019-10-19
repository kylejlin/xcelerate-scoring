import firebase from "../firebase";
import stringSimilarity from "string-similarity";

import { SeasonSummary } from "../types/misc";

const db = firebase.firestore();

const { compareTwoStrings } = stringSimilarity;

export default function searchForSeason(
  query: string
): Promise<SeasonSummary[]> {
  return getAllSeasonSummaries().then(summaries =>
    sortAndFilterSummaries(query, summaries)
  );
}

function getAllSeasonSummaries(): Promise<SeasonSummary[]> {
  return db
    .collection("seasons")
    .get()
    .then(snapshot => snapshot.docs.map(getSeasonSummary));
}

function getSeasonSummary(
  doc: firebase.firestore.QueryDocumentSnapshot
): SeasonSummary {
  return {
    id: doc.id,
    name: doc.data().name,
  };
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
