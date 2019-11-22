import firebase from "../../../src/firebase";

describe("The Create Season Screen when user is signed in", function() {
  before(() => {
    cy.task("getToken", Cypress.env("TEST_ACCOUNT_UID")).then(token => {
      return firebase.auth().signInWithCustomToken(token);
    });
  });

  it("lets user navigate back", function() {
    cy.visit("/create-season");

    cy.contains("Cancel").click();

    cy.location("pathname").should("equal", "/my-seasons");
  });

  it("lets user edit season name", function() {
    cy.visit("/create-season");

    cy.contains("Name")
      .find("input")
      .clear()
      .type("My Amazing Season")
      .should("have.value", "My Amazing Season");
  });

  it("resets grade bound to default if first non-whitespace character is non-digit", function() {
    const DEFAULT_MIN_GRADE = 6;
    const DEFAULT_MAX_GRADE = 8;

    cy.visit("/create-season");

    cy.contains("Minimum grade")
      .find("input")
      .clear()
      .type(DEFAULT_MIN_GRADE - 1 + "")
      .blur()
      .clear()
      .type("abc")
      .blur()
      .should("have.value", DEFAULT_MIN_GRADE + "");

    cy.contains("Maximum grade")
      .find("input")
      .clear()
      .type(DEFAULT_MAX_GRADE + 1 + "")
      .blur()
      .clear()
      .type("abc")
      .blur()
      .should("have.value", DEFAULT_MAX_GRADE + "");
  });

  it("truncates grade bound if user types a float", function() {
    cy.visit("/create-season");

    cy.contains("Minimum grade")
      .find("input")
      .clear()
      .type("3.1")
      .blur()
      .should("have.value", "3");

    cy.contains("Maximum grade")
      .find("input")
      .clear()
      .type("9.1")
      .blur()
      .should("have.value", "9");
  });

  it("reorders grade bounds if min > max", function() {
    cy.visit("/create-season");

    cy.contains("Minimum grade")
      .find("input")
      .clear()
      .type("8")
      .blur();

    cy.contains("Maximum grade")
      .find("input")
      .clear()
      .type("6")
      .blur();

    cy.contains("Minimum grade")
      .find("input")
      .should("have.value", "6");

    cy.contains("Maximum grade")
      .find("input")
      .should("have.value", "8");
  });

  it("forces grade bounds to be >= 1", function() {
    cy.visit("/create-season");

    cy.contains("Minimum grade")
      .find("input")
      .clear()
      .type("0")
      .blur()
      .should("have.value", "1");

    cy.contains("Maximum grade")
      .find("input")
      .clear()
      .type("0")
      .blur()
      .should("have.value", "1");
  });

  it("lets users to add unique schools", function() {
    cy.visit("/create-season");

    cy.contains("Add school")
      .find("input")
      .type("School 1");

    cy.contains("Add").click();

    cy.contains("Add school")
      .find("input")
      .type("School 2");

    cy.contains("Add").click();

    cy.contains("Add school")
      .find("input")
      .type("School 1");

    cy.contains("Add").click();

    cy.get("ul li").should("have.length", 2);
  });

  it("doesn't let user add invalid schools", function() {
    cy.visit("/create-season");

    cy.contains("Add school")
      .find("input")
      .clear();

    cy.contains("Add").click();

    cy.contains("Add school")
      .find("input")
      .clear()
      .type(" ");

    cy.contains("Add").click();

    cy.get("ul li").should("have.length", 0);
  });

  it("lets user create season if name and schools are valid", function() {
    cy.visit("/create-season");

    const seasonName = "My Amazing Season " + generateRandomAlphaNumStr(6);

    cy.contains("Name")
      .find("input")
      .clear()
      .type(seasonName);

    cy.contains("Add school")
      .find("input")
      .type("School 1");

    cy.contains("Add").click();

    cy.contains("Add school")
      .find("input")
      .type("School 2");

    cy.contains("Add").click();

    cy.contains("Create season").click();

    // createSeason() cloud function may be dormant, so give it time to awaken.
    cy.contains("Your seasons", { timeout: 20e3 });
    cy.contains(seasonName);
  });
});

describe("The Create Season Page when user is not signed in", function() {
  before(() => {
    return firebase.auth().signOut();
  });

  it("redirects to Sign In Screen", function() {
    cy.visit("/create-season");

    cy.location("pathname").should("equal", "/sign-in");
  });
});

function generateRandomAlphaNumStr(len: number): string {
  let out = "";
  while (out.length < len) {
    out += Math.floor(36 * Math.random()).toString(36);
  }
  return out;
}
