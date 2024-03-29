import App from "./App";
import { StateType } from "./types/states";
import Option from "./types/Option";
import { api, User } from "./api";
import { Gender, AthleteOrSchool } from "./types/misc";
import { RaceDivisionUtil, RaceDivision } from "./types/race";
import guessFullName from "./guessFullName";

// TODO
// DRY
// Code  in load*Screen() duplicated from numerous controllers
export default class ScreenLoader {
  constructor(private app: App, private user: Option<User>) {
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

  private loadUserSeasonsScreenFallingBackToSignIn() {
    this.getUserOrLoadSignInScreen(this.loadUserSeasonsScreen);
  }

  private getUserOrLoadSignInScreen(callback: (user: User) => void) {
    this.user.match({
      none: () => {
        this.app.replaceScreen(StateType.SignIn, {});
      },
      some: callback,
    });
  }

  private loadUserSeasonsScreen(user: User) {
    this.app
      .replaceScreen(StateType.UserSeasons, {
        user,
        seasons: Option.none(),
      })
      .then(screen => {
        api.getUserSeasons(user.uid).then(seasons => {
          screen.update({ seasons: Option.some(seasons) });
        });
      });
  }

  private loadUserProfileScreenFallingBackToSignIn() {
    this.getUserOrLoadSignInScreen(this.loadUserProfileScreen);
  }

  private loadUserProfileScreen(user: User) {
    this.app
      .replaceScreen(StateType.UserProfile, {
        user,
        fullName: Option.none(),
        doesUserExist: true,
      })
      .then(screen => {
        api.getUserName(user.uid).then(profile => {
          profile.match({
            none: () => {
              screen.update({
                fullName: Option.some(guessFullName(user.displayName || "")),
                doesUserExist: false,
              });
            },
            some: profile => {
              screen.update({ fullName: Option.some(profile) });
            },
          });
        });
      });
  }

  private loadCreateSeasonScreenFallingBackToSignIn() {
    this.getUserOrLoadSignInScreen(this.loadCreateSeasonScreen);
  }

  private loadCreateSeasonScreen(user: User) {
    this.app.replaceScreen(StateType.CreateSeason, {
      user,
      seasonName: "My Awesome Season",
      minGrade: "6",
      maxGrade: "8",
      schools: [],
      newSchoolName: "",
      isCreatingSeason: false,
    });
  }

  private loadSeasonMenu(seasonId: string) {
    api.getSeason(seasonId).then(season => {
      this.app.replaceScreen(StateType.SeasonMenu, {
        user: this.user,
        season: season,
      });
    });
  }

  private loadAthletesMenu(seasonId: string) {
    // TODO DRY
    // Duplicates getSharedControllerMethods.navigateToAthletesMenu
    api.getSeason(seasonId).then(season => {
      const user = this.user;
      this.app
        .replaceScreen(StateType.AthletesMenu, {
          user,
          doesUserHaveWriteAccess: false,
          season: season,
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
            api
              .getUserSeasonPermissions(user.uid, seasonId)
              .then(permissions => {
                if (permissions.hasWriteAccess) {
                  screen.update({ doesUserHaveWriteAccess: true });
                }
              });
          });

          const { teamsRecipe, athletes } = api.openSeasonAthletesHandleUntil(
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

  private loadPasteAthletesScreen(seasonId: string, user: User) {
    api.getSeason(seasonId).then(season => {
      this.app
        .replaceScreen(StateType.PasteAthletes, {
          user,
          season: season,
          spreadsheetData: "",
          schools: Option.none(),
          selectedSchool: Option.none(),
        })
        .then(screen => {
          api.getSeason(screen.state.season.id).then(season => {
            screen.update({ schools: Option.some(season.schools) });
          });
        });
    });
  }

  private loadAddAthletesScreenFallingBackToSignIn(seasonId: string) {
    this.getUserOrLoadSignInScreen(user => {
      this.loadAddAthletesScreen(seasonId, user);
    });
  }

  private loadAddAthletesScreen(seasonId: string, user: User) {
    api.getSeason(seasonId).then(season => {
      this.app
        .replaceScreen(StateType.AddAthletes, {
          user,
          season: season,
          wereAthletesPasted: false,
          athletes: [],
          pendingAthleteEdit: Option.none(),
          raceDivisions: Option.none(),
          areAthletesBeingAdded: false,
        })
        .then(screen => {
          api.getSeason(screen.state.season.id).then(season => {
            screen.update({ raceDivisions: Option.some(season) });
          });
        });
    });
  }

  private loadAssistantsMenu(seasonId: string) {
    api.getSeason(seasonId).then(season => {
      const user = this.user;
      this.app
        .replaceScreen(StateType.AssistantsMenu, {
          user,
          doesUserHaveWriteAccess: false,
          isUserOwner: false,
          season: season,
          owner: Option.none(),
          assistants: Option.none(),
          assistantQuery: "",
          queryResults: Option.none(),
          areQueryResultsLoading: false,
        })
        .then(screen => {
          const { season, user } = screen.state;
          api
            .getSeasonOwnerAndAssistants(season.id)
            .then(([owner, assistants]) => {
              screen.update({
                owner: Option.some(owner),
                assistants: Option.some(assistants),
              });
            });
          user.ifSome(user => {
            api
              .getUserSeasonPermissions(user.uid, season.id)
              .then(permissions => {
                screen.update({
                  isUserOwner: permissions.isOwner,
                  doesUserHaveWriteAccess: permissions.hasWriteAccess,
                });
              });
          });
        });
    });
  }

  private loadSeasonMeetsScreen(seasonId: string) {
    api.getSeason(seasonId).then(season => {
      const user = this.user;
      this.app
        .replaceScreen(StateType.SeasonMeets, {
          user,
          doesUserHaveWriteAccess: false,
          season: season,
          meets: Option.none(),
          gradeBounds: Option.none(),
          pendingMeetName: "",
        })
        .then(screen => {
          const seasonId = season.id;
          user.ifSome(user => {
            api
              .getUserSeasonPermissions(user.uid, seasonId)
              .then(permissions => {
                if (permissions.hasWriteAccess) {
                  screen.update({ doesUserHaveWriteAccess: true });
                }
              });
          });
          api.getSeasonMeets(seasonId).then(meets => {
            screen.update({ meets: Option.some(meets) });
          });
          api.getSeason(screen.state.season.id).then(season => {
            screen.update({
              gradeBounds: Option.some({
                min: season.minGrade,
                max: season.maxGrade,
              }),
            });
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

  private loadEditMeetScreen(seasonId: string, meetId: string, user: User) {
    Promise.all([api.getSeason(seasonId), api.getMeet(seasonId, meetId)]).then(
      ([season, meet]) => {
        this.app
          .replaceScreen(StateType.EditMeet, {
            user,
            season: season,
            meetSummary: meet,
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

            const { meet, raceDivisions } = api.openMeetHandleUntil(
              state.season.id,
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

            const { athletes } = api.openSeasonAthletesHandleUntil(
              state.season.id,
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
    Promise.all([api.getSeason(seasonId), api.getMeet(seasonId, meetId)]).then(
      ([season, meet]) => {
        const user = this.user;
        this.app
          .replaceScreen(StateType.ViewMeet, {
            user,
            season: season,
            meetSummary: meet,
            divisionsRecipe: Option.none(),
            orderedRaces: Option.none(),
            viewedDivision: Option.none(),
            viewedResultType: AthleteOrSchool.Athlete,
            athletes: Option.none(),
          })
          .then(screen => {
            const { state } = screen;

            const { meet, raceDivisions } = api.openMeetHandleUntil(
              state.season.id,
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

            const { athletes } = api.openSeasonAthletesHandleUntil(
              state.season.id,
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
