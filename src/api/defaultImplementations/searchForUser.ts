import firebase from "../../firebase";
import stringSimilarity from "string-similarity";

import { UserAccount } from "../../types/misc";

const db = firebase.firestore();

const { compareTwoStrings } = stringSimilarity;

export default function searchForUser(query: string): Promise<UserAccount[]> {
  return getAllUsers().then(users => sortAndFilterUsers(query, users));
}

function getAllUsers(): Promise<UserAccount[]> {
  return db
    .collection("users")
    .get()
    .then(userCollection => userCollection.docs.map(getUser));
}

function getUser(doc: firebase.firestore.QueryDocumentSnapshot): UserAccount {
  const data = doc.data();
  return { id: doc.id, firstName: data.firstName, lastName: data.lastName };
}

function sortAndFilterUsers(
  query: string,
  users: UserAccount[]
): UserAccount[] {
  const lowerCaseQuery = query.toLowerCase();
  const ratedUsers = users.map(user => ({
    user,
    similarity: compareTwoStrings(
      lowerCaseQuery,
      getFullName(user).toLowerCase()
    ),
  }));
  return ratedUsers
    .sort((a, b) => b.similarity - a.similarity)
    .filter(ru => ru.similarity >= CUTOFF)
    .map(ru => ru.user);
}

function getFullName(user: UserAccount): string {
  return user.firstName + " " + user.lastName;
}

const CUTOFF = 0.1;
