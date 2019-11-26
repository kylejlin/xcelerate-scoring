import visitAndManipulatePage from "../../visitAndManipulatePage";
import disableAllApiFunctions from "../../disableAllApiFunctions";
import stubAuth from "../../stubAuth";
import { StubbableApi } from "../../../src/api/StubbableApi";
import { SeasonSpec, Season } from "../../../src/types/misc";
import generateRandomAlphaNumStr from "../../generateRandomAlphaNumStr";
import { getHooks } from "../../../src/testingHooks";

describe("The Create Season Screen when user is signed in", function() {
  beforeEach(function() {
    visitAndManipulatePage("/create-season", hooks => {
      const { api } = hooks;

      disableAllApiFunctions(api, err => {
        hooks.errors.push(err);
      });

      stubAuth(api);

      stubDoesUserAccountExist(api, expect);
      stubCreateSeason(api);
      stubGetUserSeasons(api);

      api.signIntoGoogleWithRedirect();
    });
  });

  afterEach(function() {
    cy.window().then(win => {
      const { errors } = getHooks(win);

      if (errors.length > 0) {
        throw errors[0];
      }
    });
  });

  it("lets user navigate back", function() {
    cy.contains("Cancel").click();

    cy.location("pathname").should("equal", "/my-seasons");
  });

  it("lets user edit season name", function() {
    cy.contains("Name")
      .find("input")
      .clear()
      .type("My Amazing Season")
      .should("have.value", "My Amazing Season");
  });

  it("resets grade bound to default if first non-whitespace character is non-digit", function() {
    const DEFAULT_MIN_GRADE = 6;
    const DEFAULT_MAX_GRADE = 8;

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

    cy.contains("Your seasons");
    cy.contains(seasonName);
  });
});

describe("The Create Season Page when user is not signed in", function() {
  beforeEach(function() {
    visitAndManipulatePage("/create-season", hooks => {
      const { api } = hooks;

      disableAllApiFunctions(api, err => {
        hooks.errors.push(err);
      });

      stubAuth(api);

      stubDoesUserAccountExist(api, expect);

      api.signOut();
    });
  });

  it("redirects to Sign In Screen", function() {
    cy.location("pathname").should("equal", "/sign-in");
  });
});

function stubDoesUserAccountExist(
  api: StubbableApi,
  expect: Chai.ExpectStatic
): void {
  api.override("doesUserAccountExist", function doesUserAccountExist(
    userUid: string
  ): Promise<boolean> {
    expect(userUid).to.be.equal(Cypress.env("TEST_ACCOUNT_UID"));

    return Promise.resolve(true);
  });
}

function stubCreateSeason(api: StubbableApi): void {
  api.override("createSeason", function createSeason(
    season: SeasonSpec
  ): Promise<Season> {
    const { name, minGrade, maxGrade, schools } = season;

    return Promise.resolve({
      id: generateRandomAlphaNumStr(20),
      ownerId: Cypress.env("TEST_ACCOUNT_UID"),
      assistantIds: [],
      name,
      minGrade,
      maxGrade,
      schools,
    });
  });
}

function stubGetUserSeasons(api: StubbableApi): void {
  api.override("getUserSeasons", function getUserSeasons(): Promise<Season[]> {
    return Promise.resolve([
      {
        id: generateRandomAlphaNumStr(20),
        ownerId: Cypress.env("TEST_ACCOUNT_UID"),
        assistantIds: [],
        name: "My Awesome Season " + generateRandomAlphaNumStr(6),
        minGrade: 6,
        maxGrade: 8,
        schools: ["School 1", "School 2"],
      },
    ]);
  });
}
