import App from "./App";
import { StateType } from "./types/states";
import Option from "./types/Option";
import getUserSeasons from "./firestore/getUserSeasons";
import getUserName from "./firestore/getUserName";
import {
  CachedState,
  SeasonMenuCachedState,
  AthletesMenuCachedState,
  PasteAthletesCachedState,
  AddAthletesCachedState,
  AssistantsMenuCachedState,
  SeasonMeetsCachedState,
  EditMeetCachedState,
  ViewMeetCachedState,
} from "./cachedState";
import { Gender, AthleteOrSchool } from "./types/misc";
import doesUserHaveWriteAccessToSeason from "./firestore/getUserSeasonPermissions";
import openSeasonAthletesHandleUntil from "./firestore/openSeasonAthletesHandleUntil";
import getSeasonSchools from "./firestore/getSeasonSchools";
import getSeasonRaceDivisions from "./firestore/getSeasonRaceDivisions";
import getSeasonOwnerAndAssistants from "./firestore/getSeasonOwnerAndAssistants";
import getUserSeasonPermissions from "./firestore/getUserSeasonPermissions";
import getSeasonMeets from "./firestore/getSeasonMeets";
import getSeasonGradeBounds from "./firestore/getSeasonGradeBounds";
import openMeetHandleUntil from "./firestore/openMeetHandleUntil";
import { RaceDivisionUtil, RaceDivision } from "./types/race";

// TODO
// Instead of calling this.getUser.expect()
// If user is Option::None, navigate to SignIn screen.
// TODO
// DRY
// Code  in load*Screen() duplicated from numerous controllers
export default class StatePopper {
  constructor(private app: App) {}

  revertTo(state: CachedState): void {
    switch (state.kind) {
      case StateType.SearchForSeason:
        this.loadSearchForSeasonScreen();
        break;
      case StateType.SignIn:
        this.loadUserSeasonsScreenFallingBackToSignIn();
        break;
      case StateType.UserSeasons:
        this.loadUserSeasonsScreenFallingBackToSignIn();
        break;
      case StateType.UserProfile:
        this.loadUserProfileScreenFallingBackToSignIn();
        break;
      case StateType.CreateSeason:
        this.loadCreateSeasonScreenFallingBackToSignIn();
        break;
      case StateType.SeasonMenu:
        this.loadSeasonMenu(state);
        break;
      case StateType.AthletesMenu:
        this.loadAthletesMenu(state);
        break;
      case StateType.PasteAthletes:
        this.loadPasteAthletesScreenFallingBackToSignIn(state);
        break;
      case StateType.AddAthletes:
        this.loadAddAthletesScreenFallingBackToSignIn(state);
        break;
      case StateType.AssistantsMenu:
        this.loadAssistantsMenu(state);
        break;
      case StateType.SeasonMeets:
        this.loadSeasonMeetsScreen(state);
        break;
      case StateType.EditMeet:
        this.loadEditMeetScreenFallingBackToSignIn(state);
        break;
      case StateType.ViewMeet:
        this.loadViewMeetScreen(state);
        break;
    }
  }

  private loadSearchForSeasonScreen() {
    this.app.replaceScreen(StateType.SearchForSeason, {
      user: this.getUser(),
      query: "",
      isLoading: false,
      seasons: Option.none(),
    });
  }

  private getUser(): Option<firebase.User> {
    return this.app.getUser();
  }

  private loadUserSeasonsScreenFallingBackToSignIn() {
    this.getUserOrLoadSignInScreen(this.loadUserSeasonsScreen);
  }

  private getUserOrLoadSignInScreen(callback: (user: firebase.User) => void) {
    this.getUser().match({
      none: () => {
        this.app.replaceScreen(StateType.SignIn, {});
      },
      some: callback,
    });
  }

  private loadUserSeasonsScreen(user: firebase.User) {
    this.app
      .replaceScreen(StateType.UserSeasons, {
        user,
        seasons: Option.none(),
      })
      .then(screen => {
        getUserSeasons(user).then(seasonSummaries => {
          screen.update({ seasons: Option.some(seasonSummaries) });
        });
      });
  }

  private loadUserProfileScreenFallingBackToSignIn() {
    this.getUserOrLoadSignInScreen(this.loadUserProfileScreen);
  }

  private loadUserProfileScreen(user: firebase.User) {
    this.app
      .replaceScreen(StateType.UserProfile, {
        user,
        fullName: Option.none(),
      })
      .then(screen => {
        getUserName(screen.state.user).then(profile => {
          screen.update({ fullName: Option.some(profile) });
        });
      });
  }

  private loadCreateSeasonScreenFallingBackToSignIn() {
    this.getUserOrLoadSignInScreen(this.loadCreateSeasonScreen);
  }

  private loadCreateSeasonScreen(user: firebase.User) {
    this.app.replaceScreen(StateType.CreateSeason, {
      user,
      seasonName: "My Awesome Season",
      minGrade: "6",
      maxGrade: "8",
      schools: [],
      newSchoolName: "",
    });
  }

  private loadSeasonMenu(state: SeasonMenuCachedState) {
    const { seasonSummary } = state;
    this.app.replaceScreen(StateType.SeasonMenu, {
      user: this.getUser(),
      seasonSummary,
    });
  }

  private loadAthletesMenu(state: AthletesMenuCachedState) {
    // TODO DRY
    // Duplicates getSharedControllerMethods.navigateToAthletesMenu
    const user = this.getUser();
    const { seasonSummary } = state;
    this.app
      .replaceScreen(StateType.AthletesMenu, {
        user,
        doesUserHaveWriteAccess: false,
        seasonSummary: seasonSummary,
        athletes: Option.none(),
        athleteFilter: {
          grade: Option.none<number>(),
          gender: Option.none<Gender>(),
          school: Option.none<string>(),
        },
        teamsRecipe: Option.none(),
        shouldSortByLastName: false,
        pendingAthleteEdit: Option.none(),
        pendingEditsBeingSyncedWithFirestore: [],
        deleteAthletes: Option.none(),
        isSpreadsheetDataShown: false,
      })
      .then(screen => {
        const seasonId = seasonSummary.id;

        user.ifSome(user => {
          doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
            if (hasAccess) {
              screen.update({ doesUserHaveWriteAccess: true });
            }
          });
        });

        const {
          teamsRecipe: raceDivisions,
          athletes,
        } = openSeasonAthletesHandleUntil(seasonId, screen.expiration);
        raceDivisions.then(raceDivisions => {
          screen.update({ teamsRecipe: Option.some(raceDivisions) });
        });
        athletes.onUpdate(athletes => {
          screen.update({ athletes: Option.some(athletes) });
        });
      });
  }

  private loadPasteAthletesScreenFallingBackToSignIn(
    state: PasteAthletesCachedState
  ) {
    this.getUserOrLoadSignInScreen(user => {
      this.loadPasteAthletesScreen(state, user);
    });
  }

  private loadPasteAthletesScreen(
    state: PasteAthletesCachedState,
    user: firebase.User
  ) {
    this.app
      .replaceScreen(StateType.PasteAthletes, {
        user,
        seasonSummary: state.seasonSummary,
        spreadsheetData: "",
        schools: Option.none(),
        selectedSchool: Option.none(),
      })
      .then(screen => {
        getSeasonSchools(screen.state.seasonSummary.id).then(schools => {
          screen.update({ schools: Option.some(schools) });
        });
      });
  }

  private loadAddAthletesScreenFallingBackToSignIn(
    state: AddAthletesCachedState
  ) {
    this.getUserOrLoadSignInScreen(user => {
      this.loadAddAthletesScreen(state, user);
    });
  }

  private loadAddAthletesScreen(
    state: AddAthletesCachedState,
    user: firebase.User
  ) {
    this.app
      .replaceScreen(StateType.AddAthletes, {
        user,
        seasonSummary: state.seasonSummary,
        wereAthletesPasted: state.wereAthletesPasted,
        athletes: [],
        pendingAthleteEdit: Option.none(),
        raceDivisions: Option.none(),
        areAthletesBeingAdded: false,
      })
      .then(screen => {
        getSeasonRaceDivisions(screen.state.seasonSummary.id).then(
          raceDivisions => {
            screen.update({ raceDivisions: Option.some(raceDivisions) });
          }
        );
      });
  }

  private loadAssistantsMenu(state: AssistantsMenuCachedState) {
    const user = this.getUser();
    const { seasonSummary } = state;
    this.app
      .replaceScreen(StateType.AssistantsMenu, {
        user,
        doesUserHaveWriteAccess: false,
        isUserOwner: false,
        seasonSummary,
        owner: Option.none(),
        assistants: Option.none(),
        assistantQuery: "",
        queryResults: Option.none(),
        areQueryResultsLoading: false,
      })
      .then(screen => {
        const { seasonSummary, user } = screen.state;
        getSeasonOwnerAndAssistants(seasonSummary.id).then(
          ([owner, assistants]) => {
            screen.update({
              owner: Option.some(owner),
              assistants: Option.some(assistants),
            });
          }
        );
        user.ifSome(user => {
          getUserSeasonPermissions(user, seasonSummary.id).then(permissions => {
            screen.update({
              isUserOwner: permissions.isOwner,
              doesUserHaveWriteAccess: permissions.hasWriteAccess,
            });
          });
        });
      });
  }

  private loadSeasonMeetsScreen(state: SeasonMeetsCachedState) {
    const user = this.getUser();
    const { seasonSummary } = state;
    this.app
      .replaceScreen(StateType.SeasonMeets, {
        user,
        doesUserHaveWriteAccess: false,
        seasonSummary,
        meets: Option.none(),
        gradeBounds: Option.none(),
        pendingMeetName: "",
      })
      .then(screen => {
        const seasonId = seasonSummary.id;
        user.ifSome(user => {
          doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
            if (hasAccess) {
              screen.update({ doesUserHaveWriteAccess: true });
            }
          });
        });
        getSeasonMeets(seasonId).then(meets => {
          screen.update({ meets: Option.some(meets) });
        });
        getSeasonGradeBounds(seasonId).then(gradeBounds => {
          screen.update({ gradeBounds: Option.some(gradeBounds) });
        });
      });
  }

  private loadEditMeetScreenFallingBackToSignIn(state: EditMeetCachedState) {
    this.getUserOrLoadSignInScreen(user => {
      this.loadEditMeetScreen(state, user);
    });
  }

  private loadEditMeetScreen(state: EditMeetCachedState, user: firebase.User) {
    const { seasonSummary, meetSummary } = state;
    this.app
      .replaceScreen(StateType.EditMeet, {
        user,
        seasonSummary,
        meetSummary,
        divisionsRecipe: Option.none(),
        orderedRaces: Option.none(),
        editedDivision: Option.none(),
        pendingAthleteId: "",
        insertionIndex: Option.none(),
        athletes: Option.none(),
        athleteIdWhichCouldNotBeInserted: Option.none(),
        pendingActions: [],
      })
      .then(screen => {
        const { state } = screen;

        const { meet, raceDivisions } = openMeetHandleUntil(
          state.seasonSummary.id,
          state.meetSummary.id,
          screen.expiration
        );

        meet.onUpdate(meet => {
          screen.update({
            orderedRaces: Option.some(meet.divisionFinisherIds),
          });
        });

        raceDivisions.then(raceDivisions => {
          const orderedDivisions = RaceDivisionUtil.getOrderedDivisions(
            raceDivisions
          );
          const firstDivision: Option<RaceDivision> =
            orderedDivisions.length > 0
              ? Option.some(orderedDivisions[0])
              : Option.none();
          screen.update({
            divisionsRecipe: Option.some(raceDivisions),
            editedDivision: firstDivision,
          });
        });

        const { athletes } = openSeasonAthletesHandleUntil(
          state.seasonSummary.id,
          screen.expiration
        );
        athletes.onUpdate(athletes => {
          screen.update({ athletes: Option.some(athletes) });
        });
      });
  }

  private loadViewMeetScreen(state: ViewMeetCachedState) {
    const user = this.getUser();
    const { seasonSummary, meetSummary } = state;
    this.app
      .replaceScreen(StateType.ViewMeet, {
        user,
        seasonSummary,
        meetSummary,
        divisionsRecipe: Option.none(),
        orderedRaces: Option.none(),
        viewedDivision: Option.none(),
        viewedResultType: AthleteOrSchool.Athlete,
        athletes: Option.none(),
      })
      .then(screen => {
        const { state } = screen;

        const { meet, raceDivisions } = openMeetHandleUntil(
          state.seasonSummary.id,
          state.meetSummary.id,
          screen.expiration
        );

        meet.onUpdate(meet => {
          screen.update({
            orderedRaces: Option.some(meet.divisionFinisherIds),
          });
        });

        raceDivisions.then(raceDivisions => {
          const orderedDivisions = RaceDivisionUtil.getOrderedDivisions(
            raceDivisions
          );
          const firstDivision: Option<RaceDivision> =
            orderedDivisions.length > 0
              ? Option.some(orderedDivisions[0])
              : Option.none();
          screen.update({
            divisionsRecipe: Option.some(raceDivisions),
            viewedDivision: firstDivision,
          });
        });

        const { athletes } = openSeasonAthletesHandleUntil(
          state.seasonSummary.id,
          screen.expiration
        );
        athletes.onUpdate(athletes => {
          screen.update({ athletes: Option.some(athletes) });
        });
      });
  }
}
