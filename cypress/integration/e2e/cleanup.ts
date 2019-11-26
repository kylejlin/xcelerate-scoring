import firebase from "../../../src/firebase";
import deleteSeason from "../../deleteSeason";
import { getHooks } from "../../../src/testingHooks";
import Option from "../../../src/types/Option";
import { Season } from "../../../src/types/misc";

const TEST_SEASON_REGEX = /My Amazing Season [a-z0-9]{6}/;

describe("The cleanup script", function() {
  before(() => {
    cy.task("getToken", Cypress.env("TEST_ACCOUNT_UID")).then(token => {
      return firebase.auth().signInWithCustomToken(token);
    });
  });

  it("deletes all test seasons", function() {
    cy.visit("/my-seasons");

    cy.contains("Your seasons");

    cy.window().then(win => {
      const { app } = getHooks(win);
      const seasons: Option<Season[]> = (app.state as any).seasons;

      cy.wrap(seasons).should("satisfy", seasons => seasons.isSome());

      const testSeasons = seasons
        .unwrap()
        .filter((season: Season) => TEST_SEASON_REGEX.test(season.name));

      cy.wrap(testSeasons).as("testSeasons");
    });

    // deleteTestSeason() cloud function may be dormant, so give it time to awaken.
    cy.wrap(null).then({ timeout: 20e3 }, () => {
      return Promise.all(
        (this.testSeasons as Season[]).map(testSeason =>
          deleteSeason(testSeason.id)
        )
      );
    });

    cy.reload();

    cy.contains("Your seasons");

    cy.contains(TEST_SEASON_REGEX).should("not.exist");
  });
});
