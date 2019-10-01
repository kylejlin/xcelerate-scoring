import React from "react";

import { ViewMeetState } from "../types/states";
import { ViewMeetController } from "../types/controllers";

import { RaceDivisionUtil } from "../types/race";
import Option from "../types/Option";
import { Athlete, AthleteOrSchool } from "../types/misc";
import scoreRace from "../types/scoring";

export default function ViewMeet({
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
      <h2>{state.meetSummary.name} - View results</h2>

      {Option.all([
        state.divisionsRecipe,
        state.orderedRaces,
        state.athletes,
        state.viewedDivision,
      ]).match({
        none: () => <p>Loading races...</p>,
        some: ([divisionsRecipe, orderedRaces, athletes, viewedDivision]) => {
          const orderedDivisions = RaceDivisionUtil.getOrderedDivisions(
            divisionsRecipe
          );
          const divisionStr = RaceDivisionUtil.stringify(viewedDivision);
          const race =
            orderedRaces[
              orderedDivisions.findIndex(division =>
                RaceDivisionUtil.areDivisionsEqual(division, viewedDivision)
              )
            ];
          const finishers = getFinishingAthletesIfAllCanBeFound(race, athletes);

          return finishers.match({
            none: () => <p>Athletes not found, please reload the page.</p>,
            some: finishers => {
              const results = scoreRace(finishers);
              return (
                <div>
                  <select
                    value={divisionStr}
                    onChange={controller.selectDivision}
                  >
                    {orderedDivisions
                      .map(RaceDivisionUtil.stringify)
                      .map(division => (
                        <option key={division} value={division}>
                          {division}
                        </option>
                      ))}
                  </select>
                  <select
                    value={state.viewedResultType}
                    onChange={controller.selectResultType}
                  >
                    <option value={AthleteOrSchool.Athlete}>Athletes</option>
                    <option value={AthleteOrSchool.School}>Schools</option>
                  </select>
                  <h3>{divisionStr}</h3>
                  <table>
                    <tbody>
                      {(() => {
                        switch (state.viewedResultType) {
                          case AthleteOrSchool.Athlete:
                            return (
                              <>
                                <tr>
                                  <th>Place</th>
                                  <th>Team place</th>
                                  <th>First</th>
                                  <th>Last</th>
                                  <th>School</th>
                                </tr>
                                {finishers.map((finisher, i) => (
                                  <tr key={finisher.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                      {results.athleteTeamPlaces[
                                        finisher.id
                                      ].unwrapOr("")}
                                    </td>
                                    <td>{finisher.firstName}</td>
                                    <td>{finisher.lastName}</td>
                                    <td>{finisher.school}</td>
                                  </tr>
                                ))}
                              </>
                            );
                          case AthleteOrSchool.School:
                            return (
                              <>
                                <tr>
                                  <th>Place</th>
                                  <th>Points</th>
                                  <th>School</th>
                                </tr>
                                {results.schoolResults.map(result => (
                                  <tr key={result.school}>
                                    <td>{result.place}</td>
                                    <td>
                                      {result.numberOfFinishersIfIncomplete.match(
                                        {
                                          none: () => result.points,
                                          some: numberOfFinishers =>
                                            result.points +
                                            " - Incomplete (" +
                                            numberOfFinishers +
                                            " finishers)",
                                        }
                                      )}
                                    </td>
                                    <td>{result.school}</td>
                                  </tr>
                                ))}
                              </>
                            );
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              );
            },
          });
        },
      })}
    </div>
  );
}

interface Props {
  state: ViewMeetState;
  controller: ViewMeetController;
}

function getFinishingAthletesIfAllCanBeFound(
  finisherIds: number[],
  athletes: Athlete[]
): Option<Athlete[]> {
  const finishers: Athlete[] = [];
  for (let i = 0; i < finisherIds.length; i++) {
    const id = finisherIds[i];
    const athlete = athletes.find(a => parseInt(a.id, 10) === id);
    if (athlete === undefined) {
      return Option.none();
    } else {
      finishers.push(athlete);
    }
  }
  return Option.some(finishers);
}
