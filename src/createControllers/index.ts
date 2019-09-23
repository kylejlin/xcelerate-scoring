import { ControllerCollection } from "../types/controllers";

import App from "../App";

import getSharedControllerMethods from "./controllerFactories/getSharedControllerMethods";
import getSearchForSeasonController from "./controllerFactories/getSearchForSeasonController";
import getSignInController from "./controllerFactories/getSignInController";
import getUserSeasonsController from "./controllerFactories/getUserSeasonsController";
import getUserProfileController from "./controllerFactories/getUserProfileController";
import getCreateSeasonController from "./controllerFactories/getCreateSeasonController";
import getSeasonMenuController from "./controllerFactories/getSeasonMenuController";
import getAthletesMenuController from "./controllerFactories/getAthletesMenuController";
import getPasteAthletesController from "./controllerFactories/getPasteAthletesController";
import getAddAthletesController from "./controllerFactories/getAddAthletesController";
import getSeasonsMeetsController from "./controllerFactories/getSeasonMeetsController";
import getEditMeetController from "./controllerFactories/getEditMeetController";
import getViewMeetController from "./controllerFactories/getViewMeetController";
import getAssistantsMenuController from "./controllerFactories/getAssistantsMenuController";

import { getUnknownScreenHandle, getScreenGuarantee } from "./handleFactories";

export default function createControllers(app: App): ControllerCollection {
  const shared = getSharedControllerMethods(getUnknownScreenHandle(app));

  const searchForSeasonController = getSearchForSeasonController(app, shared);
  const signInController = getSignInController(app, shared);
  const userSeasonsController = getUserSeasonsController(app, shared);
  const userProfileController = getUserProfileController(app, shared);
  const createSeasonController = getCreateSeasonController(app, shared);
  const seasonMenuController = getSeasonMenuController(app, shared);
  const athletesMenuController = getAthletesMenuController(app, shared);
  const pasteAthletesController = getPasteAthletesController(app, shared);
  const addAthletesController = getAddAthletesController(
    getScreenGuarantee(app),
    shared
  );
  const seasonMeetsController = getSeasonsMeetsController(
    getScreenGuarantee(app),
    shared
  );
  const editMeetController = getEditMeetController(
    getScreenGuarantee(app),
    shared
  );
  const viewMeetController = getViewMeetController(app, shared);
  const assistantsMenuController = getAssistantsMenuController(app, shared);

  return {
    searchForSeasonController,
    signInController,
    userSeasonsController,
    userProfileController,
    createSeasonController,
    seasonMenuController,
    athletesMenuController,
    pasteAthletesController,
    addAthletesController,
    seasonMeetsController,
    editMeetController,
    viewMeetController,
    assistantsMenuController,
  };
}
