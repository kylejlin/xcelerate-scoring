import firebase from "./firebase";
import React from "react";

import "./App.css";

import {
  AppState,
  SearchForSeasonState,
  StateType,
  UserProfileState,
  UserSeasonsState,
} from "./types/states";
import { createControllers, ControllerCollection } from "./types/controllers";
import doesUserAccountExist from "./firestore/doesUserAccountExist";
import getUserSeasons from "./firestore/getUserSeasons";
import guessFullName from "./guessFullName";
import Option from "./types/Option";
import LocalStorageKeys from "./types/LocalStorageKeys";

import SearchForSeason from "./components/SearchForSeason";
import SignIn from "./components/SignIn";
import WaitForSignInCompletion from "./components/WaitForSignInCompletion";
import UserSeasons from "./components/UserSeasons";
import UserProfile from "./components/UserProfile";
import CreateSeason from "./components/CreateSeason";
import SeasonMenu from "./components/SeasonMenu";
import AthletesMenu from "./components/AthletesMenu";
import PasteAthletes from "./components/PasteAthletes";
import CorrectPastedAthletes from "./components/CorrectPastedAthletes";
import SeasonMeets from "./components/SeasonMeets";

export default class App extends React.Component<{}, AppState> {
  private controllers: ControllerCollection;

  constructor(props: {}) {
    super(props);

    if (localStorage.getItem(LocalStorageKeys.IsWaitingForSignIn) === "true") {
      this.state = { kind: StateType.WaitForSignInCompletion };
    } else {
      this.state = {
        kind: StateType.SearchForSeason,
        user: Option.none(),
        query: "",
        isLoading: false,
        seasons: Option.none(),
      };
    }

    this.controllers = createControllers(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      localStorage.setItem(LocalStorageKeys.IsWaitingForSignIn, "false");
      if (user) {
        doesUserAccountExist(user).then(doesExist => {
          if (doesExist) {
            const state: UserSeasonsState = {
              kind: StateType.UserSeasons,
              user,
              seasons: Option.none(),
            };
            this.setState(state);

            getUserSeasons(user).then(seasonSummaries => {
              if (this.state.kind === StateType.UserSeasons) {
                this.setState({
                  ...this.state,
                  seasons: Option.some(seasonSummaries),
                });
              }
            });
          } else {
            const state: UserProfileState = {
              kind: StateType.UserProfile,
              user,
              fullName: Option.some(guessFullName(user.displayName || "")),
            };
            this.setState(state);
          }
        });
      } else {
        const state: SearchForSeasonState = {
          kind: StateType.SearchForSeason,
          user: Option.none(),
          query: "",
          isLoading: false,
          seasons: Option.none(),
        };
        this.setState(state);
      }
    });
  }

  render() {
    switch (this.state.kind) {
      case StateType.SearchForSeason:
        return (
          <SearchForSeason
            state={this.state}
            controller={this.controllers.searchForSeasonController}
          />
        );
      case StateType.SignIn:
        return (
          <SignIn
            state={this.state}
            controller={this.controllers.signInController}
          />
        );
      case StateType.WaitForSignInCompletion:
        return <WaitForSignInCompletion />;
      case StateType.UserSeasons:
        return (
          <UserSeasons
            state={this.state}
            controller={this.controllers.userSeasonsController}
          />
        );
      case StateType.UserProfile:
        return (
          <UserProfile
            state={this.state}
            controller={this.controllers.userProfileController}
          />
        );
      case StateType.CreateSeason:
        return (
          <CreateSeason
            state={this.state}
            controller={this.controllers.createSeasonController}
          />
        );
      case StateType.SeasonMenu:
        return (
          <SeasonMenu
            state={this.state}
            controller={this.controllers.seasonMenuController}
          />
        );
      case StateType.AthletesMenu:
        return (
          <AthletesMenu
            state={this.state}
            controller={this.controllers.athletesMenuController}
          />
        );
      case StateType.PasteAthletes:
        return (
          <PasteAthletes
            state={this.state}
            controller={this.controllers.pasteAthletesController}
          />
        );
      case StateType.CorrectPastedAthletes:
        return (
          <CorrectPastedAthletes
            state={this.state}
            controller={this.controllers.correctPastedAthletesController}
          />
        );
      case StateType.SeasonMeets:
        return (
          <SeasonMeets
            state={this.state}
            controller={this.controllers.seasonMeetsController}
          />
        );
      default:
        throw new Error("TODO: Render StateType." + StateType[this.state.kind]);
    }
  }

  getUser(): Option<firebase.User> {
    switch (this.state.kind) {
      case StateType.SearchForSeason:
        return this.state.user;
      case StateType.SignIn:
        return Option.none();
      case StateType.WaitForSignInCompletion:
        return Option.none();
      case StateType.UserSeasons:
        return Option.some(this.state.user);
      case StateType.UserProfile:
        return Option.some(this.state.user);
      case StateType.CreateSeason:
        return Option.some(this.state.user);
      case StateType.SeasonMenu:
        return this.state.user;
      case StateType.AthletesMenu:
        return this.state.user;
      case StateType.PasteAthletes:
        return Option.some(this.state.user);
      case StateType.CorrectPastedAthletes:
        return Option.some(this.state.user);
      default:
        throw new Error(
          "Cannot getUser for StateType." + StateType[this.state.kind]
        );
    }
  }
}
