import firebase from "../firebase";
import stringSimilarity from "string-similarity";

import { Season } from "../types/misc";

const db = firebase.firestore();

const { compareTwoStrings } = stringSimilarity;

export default function searchForSeason(query: string): Promise<Season[]> {
  return getAllSeasonSummaries().then(summaries =>
    sortAndFilterSummaries(query, summaries)
  );
}

function getAllSeasonSummaries(): Promise<Season[]> {
  return db
    .collection("seasons")
    .get()
    .then(snapshot => snapshot.docs.map(getSeason));
}

function getSeason(doc: firebase.firestore.QueryDocumentSnapshot): Season {
  const {
    name,
    ownerId,
    assistantIds,
    minGrade,
    maxGrade,
    schools,
  } = doc.data();
  return {
    id: doc.id,
    name,
    ownerId,
    assistantIds,
    minGrade,
    maxGrade,
    schools,
  };
}

function sortAndFilterSummaries(query: string, summaries: Season[]): Season[] {
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
