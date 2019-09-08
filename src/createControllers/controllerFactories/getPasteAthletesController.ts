import App from "../../App";

import {
  SharedControllerMethods,
  PasteAthletesController,
} from "../../types/controllers";

import {
  StateType,
  AthletesMenuState,
  CorrectPastedAthletesState,
} from "../../types/states";

import doesUserHaveWriteAccessToSeason from "../../firestore/doesUserHaveWriteAccessToSeason";

import getSeasonAthletes from "../../firestore/getSeasonAthletes";

import getSeasonAthleteFilterOptions from "../../firestore/getSeasonAthleteFilterOptions";

import parseSpreadsheetData from "../../parseSpreadsheetData";

import getSeasonGradeBounds from "../../firestore/getSeasonGradeBounds";
import Option from "../../types/Option";

export default function getPasteAthletesController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): PasteAthletesController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      // TODO DRY
      // This code loosely repeats seasonMenuController.navigateToAthletesMenu
      if (app.state.kind === StateType.PasteAthletes) {
        app.newScreen<AthletesMenuState>({
          kind: StateType.AthletesMenu,
          user: Option.some(app.state.user),
          doesUserHaveWriteAccess: false,
          seasonSummary: app.state.seasonSummary,
          athletes: Option.none(),
          athleteFilter: {
            grade: Option.none(),
            gender: Option.none(),
            school: Option.none(),
          },
          athleteFilterOptions: Option.none(),
          shouldSortByLastName: false,
          pendingAthleteEdit: Option.none(),
          pendingEditsBeingSyncedWithFirestore: [],
          athleteConsideredForDeletion: Option.none(),
          isSpreadsheetDataShown: false,
        });

        const seasonId = app.state.seasonSummary.id;
        doesUserHaveWriteAccessToSeason(app.state.user, seasonId).then(
          hasAccess => {
            if (hasAccess) {
              app.setState(prevState => ({
                ...prevState,
                doesUserHaveWriteAccess: true,
              }));
            }
          }
        );
        Promise.all([
          getSeasonAthletes(seasonId),
          getSeasonAthleteFilterOptions(seasonId),
        ]).then(([athletes, filterOptions]) => {
          if (app.state.kind === StateType.AthletesMenu) {
            app.setState(prevState => ({
              ...prevState,
              athletes: Option.some(athletes),
              athleteFilterOptions: Option.some(filterOptions),
            }));
          }
        });
      } else {
        throw new Error(
          "Attempted to navigateToAthletesMenu when user was not on PasteAthletes screen."
        );
      }
    },
    editSpreadsheetData(event: React.ChangeEvent) {
      if (app.state.kind === StateType.PasteAthletes) {
        const spreadsheetData = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, spreadsheetData });
      } else {
        throw new Error(
          "Attempted to editSpreadsheetData when user was not on PasteAthletes screen."
        );
      }
    },
    editSchool(event: React.ChangeEvent) {
      if (app.state.kind === StateType.PasteAthletes) {
        const schoolValue = (event.target as HTMLInputElement).value;
        const selectedSchool: Option<string> =
          schoolValue === "" ? Option.none() : Option.some(schoolValue);
        app.setState({ ...app.state, selectedSchool });
      } else {
        throw new Error(
          "Attempted to editSchool when user was not on PasteAthletes screen."
        );
      }
    },
    submitSpreadsheetData() {
      if (app.state.kind === StateType.PasteAthletes) {
        app.newScreen<CorrectPastedAthletesState>({
          kind: StateType.CorrectPastedAthletes,
          user: app.state.user,
          seasonSummary: app.state.seasonSummary,
          selectedSchool: app.state.selectedSchool.expect(
            "Attempted to submitSpreadsheetData when user had not selected a school."
          ),
          athletes: parseSpreadsheetData(app.state.spreadsheetData),
          pendingAthleteEdit: Option.none(),
          gradeBounds: Option.none(),
        });

        getSeasonGradeBounds(app.state.seasonSummary.id).then(gradeBounds => {
          if (app.state.kind === StateType.CorrectPastedAthletes) {
            app.setState({
              ...app.state,
              gradeBounds: Option.some(gradeBounds),
            });
          }
        });
      } else {
        throw new Error(
          "Attempted to submitSpreadsheetData when user was not on PasteAthletes screen."
        );
      }
    },
  };
}
