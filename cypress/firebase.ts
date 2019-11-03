const firebase_ = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");
require("firebase/functions");

const firebaseConfig = {
  apiKey: "AIzaSyAd079564PqCy3RsC-LjPvVStGqx4mETuw",
  authDomain: "xcelerate-scoring.firebaseapp.com",
  databaseURL: "https://xcelerate-scoring.firebaseio.com",
  projectId: "xcelerate-scoring",
  storageBucket: "xcelerate-scoring.appspot.com",
  messagingSenderId: "182712439706",
  appId: "1:182712439706:web:a017f66dfd021a64",
};

firebase_.initializeApp(firebaseConfig);

module.exports = firebase_;
