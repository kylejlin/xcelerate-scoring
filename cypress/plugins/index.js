// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

require("dotenv").config();

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://xcelerate-scoring.firebaseio.com",
});

module.exports = (on, config) => {
  config.env.TEST_ACCOUNT_UID = process.env.TEST_ACCOUNT_UID;

  on("task", {
    getToken(uid) {
      return admin.auth().createCustomToken(uid);
    },
  });

  return config;
};
