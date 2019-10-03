import App from "./App";
import { StateType } from "./types/states";
import Option from "./types/Option";
import getUserSeasons from "./firestore/getUserSeasons";
import getUserName from "./firestore/getUserName";
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
import getSeason from "./firestore/getSeason";
import getMeet from "./firestore/getMeet";

// TODO
// Instead of calling this.getUser.expect()
// If user is Option::None, navigate to SignIn screen.
// TODO
// DRY
// Code  in load*Screen() duplicated from numerous controllers
export default class ScreenLoader {
  constructor(private app: App, private user: Option<firebase.User>) {
    this.bindMethods();
  }

  private bindMethods() {
    this.loadUserSeasonsScreen = this.loadUserSeasonsScreen.bind(this);
    this.loadUserProfileScreen = this.loadUserProfileScreen.bind(this);
    this.loadCreateSeasonScreen = this.loadCreateSeasonScreen.bind(this);
  }

  loadScreen(pathname: string) {
    if (/^\/search-for-season\/?$/.test(pathname)) {
      this.loadSearchForSeasonScreen();
      return;
    }
    if (/^\/sign-in\/?$/.test(pathname)) {
      this.loadUserSeasonsScreenFallingBackToSignIn();
      return;
    }
    if (/^\/my-seasons\/?$/.test(pathname)) {
      this.loadUserSeasonsScreenFallingBackToSignIn();
      return;
    }
    if (/^\/my-profile\/?$/.test(pathname)) {
      this.loadUserProfileScreenFallingBackToSignIn();
      return;
    }
    if (/^\/create-season\/?$/.test(pathname)) {
      this.loadCreateSeasonScreenFallingBackToSignIn();
      return;
    }
    {
      const match = pathname.match(/^\/seasons\/(\w+)\/?$/);
      if (match !== null) {
        this.loadSeasonMenu(match[1]);
        return;
      }
    }
    {
      const match = pathname.match(/^\/seasons\/(\w+)\/athletes\/?$/);
      if (match !== null) {
        this.loadAthletesMenu(match[1]);
        return;
      }
    }
    {
      const match = pathname.match(/^\/seasons\/(\w+)\/paste-athletes\/?$/);
      if (match !== null) {
        this.loadPasteAthletesScreenFallingBackToSignIn(match[1]);
        return;
      }
    }
    {
      const match = pathname.match(/^\/seasons\/(\w+)\/add-athletes\/?$/);
      if (match !== null) {
        this.loadAddAthletesScreenFallingBackToSignIn(match[1]);
        return;
      }
    }
    {
      const match = pathname.match(/^\/seasons\/(\w+)\/assistants\/?$/);
      if (match !== null) {
        this.loadAssistantsMenu(match[1]);
        return;
      }
    }
    {
      const match = pathname.match(/^\/seasons\/(\w+)\/meets\/?$/);
      if (match !== null) {
        this.loadSeasonMeetsScreen(match[1]);
        return;
      }
    }
    {
      const match = pathname.match(/^\/seasons\/(\w+)\/meets\/(\w+)\/edit\/?$/);
      if (match !== null) {
        this.loadEditMeetScreenFallingBackToSignIn(match[1], match[2]);
        return;
      }
    }
    {
      const match = pathname.match(/^\/seasons\/(\w+)\/meets\/(\w+)\/view\/?$/);
      if (match !== null) {
        this.loadViewMeetScreen(match[1], match[2]);
        return;
      }
    }

    this.loadUserSeasonsScreenFallingBackToSignIn();
  }

  private loadSearchForSeasonScreen() {
    this.app.replaceScreen(StateType.SearchForSeason, {
      user: this.user,
      query: "",
      isLoading: false,
      seasons: Option.none(),
    });
  }

  //   private getUser(): Option<firebase.User> {
  //     return this.app.getUser();
  //   }

  private loadUserSeasonsScreenFallingBackToSignIn() {
    this.getUserOrLoadSignInScreen(this.loadUserSeasonsScreen);
  }

  private getUserOrLoadSignInScreen(callback: (user: firebase.User) => void) {
    this.user.match({
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

  private loadSeasonMenu(seasonId: string) {
    getSeason(seasonId).then(season => {
      this.app.replaceScreen(StateType.SeasonMenu, {
        user: this.user,
        seasonSummary: season,
      });
    });
  }

  private loadAthletesMenu(seasonId: string) {
    // TODO DRY
    // Duplicates getSharedControllerMethods.navigateToAthletesMenu
    getSeason(seasonId).then(season => {
      const user = this.user;
      this.app
        .replaceScreen(StateType.AthletesMenu, {
          user,
          doesUserHaveWriteAccess: false,
          seasonSummary: season,
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
          const seasonId = season.id;

          user.ifSome(user => {
            doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
              if (hasAccess) {
                screen.update({ doesUserHaveWriteAccess: true });
              }
            });
          });

          const { teamsRecipe, athletes } = openSeasonAthletesHandleUntil(
            seasonId,
            screen.expiration
          );
          teamsRecipe.then(teamsRecipe => {
            screen.update({ teamsRecipe: Option.some(teamsRecipe) });
          });
          athletes.onUpdate(athletes => {
            screen.update({ athletes: Option.some(athletes) });
          });
        });
    });
  }

  private loadPasteAthletesScreenFallingBackToSignIn(seasonId: string) {
    this.getUserOrLoadSignInScreen(user => {
      this.loadPasteAthletesScreen(seasonId, user);
    });
  }

  private loadPasteAthletesScreen(seasonId: string, user: firebase.User) {
    getSeason(seasonId).then(season => {
      this.app
        .replaceScreen(StateType.PasteAthletes, {
          user,
          seasonSummary: season,
          spreadsheetData: "",
          schools: Option.none(),
          selectedSchool: Option.none(),
        })
        .then(screen => {
          getSeasonSchools(screen.state.seasonSummary.id).then(schools => {
            screen.update({ schools: Option.some(schools) });
          });
        });
    });
  }

  private loadAddAthletesScreenFallingBackToSignIn(seasonId: string) {
    this.getUserOrLoadSignInScreen(user => {
      this.loadAddAthletesScreen(seasonId, user);
    });
  }

  private loadAddAthletesScreen(seasonId: string, user: firebase.User) {
    getSeason(seasonId).then(season => {
      this.app
        .replaceScreen(StateType.AddAthletes, {
          user,
          seasonSummary: season,
          wereAthletesPasted: false,
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
    });
  }

  private loadAssistantsMenu(seasonId: string) {
    getSeason(seasonId).then(season => {
      const user = this.user;
      this.app
        .replaceScreen(StateType.AssistantsMenu, {
          user,
          doesUserHaveWriteAccess: false,
          isUserOwner: false,
          seasonSummary: season,
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
            getUserSeasonPermissions(user, seasonSummary.id).then(
              permissions => {
                screen.update({
                  isUserOwner: permissions.isOwner,
                  doesUserHaveWriteAccess: permissions.hasWriteAccess,
                });
              }
            );
          });
        });
    });
  }

  private loadSeasonMeetsScreen(seasonId: string) {
    getSeason(seasonId).then(season => {
      const user = this.user;
      this.app
        .replaceScreen(StateType.SeasonMeets, {
          user,
          doesUserHaveWriteAccess: false,
          seasonSummary: season,
          meets: Option.none(),
          gradeBounds: Option.none(),
          pendingMeetName: "",
        })
        .then(screen => {
          const seasonId = season.id;
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
    });
  }

  private loadEditMeetScreenFallingBackToSignIn(
    seasonId: string,
    meetId: string
  ) {
    this.getUserOrLoadSignInScreen(user => {
      this.loadEditMeetScreen(seasonId, meetId, user);
    });
  }

  private loadEditMeetScreen(
    seasonId: string,
    meetId: string,
    user: firebase.User
  ) {
    Promise.all([getSeason(seasonId), getMeet(seasonId, meetId)]).then(
      ([season, meet]) => {
        this.app
          .replaceScreen(StateType.EditMeet, {
            user,
            seasonSummary: season,
            meetSummary: meet,
            divisionsRecipe: Option.none(),
            orderedRaces: Option.none(),
            editedDivision: Option.none(),
            pendingAthleteId: "",
            insertionIndex: Option.none(),
            athletes: Option.none(),
            athleteIdWhichCouldNotBeInserted: Option.none(),
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
    );
  }

  private loadViewMeetScreen(seasonId: string, meetId: string) {
    Promise.all([getSeason(seasonId), getMeet(seasonId, meetId)]).then(
      ([season, meet]) => {
        const user = this.user;
        this.app
          .replaceScreen(StateType.ViewMeet, {
            user,
            seasonSummary: season,
            meetSummary: meet,
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
    );
  }
}
