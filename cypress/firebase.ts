import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAd079564PqCy3RsC-LjPvVStGqx4mETuw",
  authDomain: "xcelerate-scoring.firebaseapp.com",
  databaseURL: "https://xcelerate-scoring.firebaseio.com",
  projectId: "xcelerate-scoring",
  storageBucket: "xcelerate-scoring.appspot.com",
  messagingSenderId: "182712439706",
  appId: "1:182712439706:web:a017f66dfd021a64",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
