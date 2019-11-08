import firebase from "../../src/firebase";

describe("The Season List Page when user is signed in", function() {
  before(() => {
    cy.task("getToken", Cypress.env("TEST_ACCOUNT_UID")).then(token => {
      return firebase.auth().signInWithCustomToken(token);
    });
  });

  it("renders the user's seasons", function() {
    cy.visit("/my-seasons");

    cy.contains("Your seasons");
  });

  it("lets the user navigate to the Create Season Screen", function() {
    cy.visit("/my-seasons");

    cy.contains("Create season").click();

    cy.location("pathname").should("equal", "/create-season");
  });

  it("lets the user navigate to the Search For Season Screen", function() {
    cy.visit("/my-seasons");

    cy.contains("Search for season").click();

    cy.location("pathname").should("equal", "/search-for-season");
  });

  it("lets the user navigate to their Profile", function() {
    cy.visit("/my-seasons");

    cy.contains("Profile").click();

    cy.location("pathname").should("equal", "/my-profile");
  });
});

describe("The Season List Page when user is not signed in", function() {
  before(() => {
    return firebase.auth().signOut();
  });

  it("redirects to Sign In Screen", function() {
    cy.visit("/my-seasons");

    cy.location("pathname").should("equal", "/sign-in");
  });
});
