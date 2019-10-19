import React from "react";

import { AssistantsMenuState } from "../types/states";
import { AssistantsMenuController } from "../types/controllers";
import { UserAccount } from "../types/misc";
import Option from "../types/Option";

export default function AssistantsMenu({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
      <button onClick={controller.navigateToSearchForSeasonScreen}>
        Search for season
      </button>
      {state.user.match({
        none: () => (
          <button onClick={controller.navigateToSignInScreen}>Sign in</button>
        ),
        some: () => (
          <>
            <button onClick={controller.navigateToUserSeasonsScreen}>
              Your seasons
            </button>
            <button onClick={controller.navigateToUserProfileScreen}>
              Profile
            </button>
          </>
        ),
      })}
      <button onClick={controller.back}>Back</button>
      <h2>{state.season.name} - Assistants</h2>
      {Option.all([state.owner, state.assistants]).match({
        none: () => <p>Loading</p>,
        some: ([owner, assistants]) => {
          const usersWithWriteAccess = [owner].concat(assistants);
          return (
            <>
              <h3>Owner</h3>
              <p>
                {owner.firstName} {owner.lastName} (#{owner.id})
              </p>
              <h3>Assistants</h3>
              <ul>
                {assistants.map(assistant => (
                  <li key={assistant.id}>
                    {assistant.firstName} {assistant.lastName} (#
                    {assistant.id}){" "}
                    {state.isUserOwner && (
                      <button
                        onClick={() => controller.deleteAssistant(assistant.id)}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {state.doesUserHaveWriteAccess && (
                <div>
                  <h3>Add assistant</h3>
                  <p>
                    Type the name of the user you want to add. Alternatively,
                    type their user ID starting with a "#"
                  </p>
                  <label>
                    Name or user ID
                    <input
                      value={state.assistantQuery}
                      onChange={controller.editAssistantQuery}
                    />
                  </label>
                  <button onClick={controller.search}>Search</button>
                  {state.queryResults.match({
                    none: () =>
                      state.areQueryResultsLoading ? <p>Loading...</p> : null,
                    some: possibleAssistants => (
                      <ul>
                        {removeUsersThatAlreadyHaveWriteAccess(
                          possibleAssistants,
                          usersWithWriteAccess
                        ).map(assistant => (
                          <li>
                            {assistant.firstName} {assistant.lastName} (#
                            {assistant.id})
                            <button
                              onClick={() => controller.addAssistant(assistant)}
                            >
                              Add
                            </button>
                          </li>
                        ))}
                      </ul>
                    ),
                  })}
                </div>
              )}
            </>
          );
        },
      })}
    </div>
  );
}

function removeUsersThatAlreadyHaveWriteAccess(
  possibleNewAssistants: UserAccount[],
  usersWithWriteAccess: UserAccount[]
): UserAccount[] {
  return possibleNewAssistants.filter(candidate =>
    usersWithWriteAccess.every(user => candidate.id !== user.id)
  );
}

interface Props {
  state: AssistantsMenuState;
  controller: AssistantsMenuController;
}
