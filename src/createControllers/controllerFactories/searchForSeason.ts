export default 9;
// import { SearchForSeasonController } from "../../types/controllers";
// import App from "../../App";
// import Option from "../../Option";
// import searchForSeason from "../../firestore/searchForSeason";

// const searchForSeasonController: (
//   app: App
// ) => SearchForSeasonController = app => {
//   return {
//     navigateToSignInScreen,
//     navigateToUserSeasonsScreen,
//     navigateToUserProfileScreen,
//     editQuery(handle: Handle<SearchForSeasonState>, event: React.ChangeEvent) {
//       handle.update({ query: (event.target as HTMLInputElement).value });
//     },
//     search(handle: Handle<SearchForSeasonState>) {
//       handle
//         .incrementallyUpdate({ isLoading: true })
//         .meanwhile(state => searchForSeason(state.query))
//         .then((handle, seasonSummaries) => {
//           handle.update({ seasonSummaries: Option.some(seasonSummaries) });
//         });
//       const state = app.state as SearchForSeasonState;
//       app.setState({ ...state, isLoading: true });
//       const originalQuery = state.query;
//       searchForSeason(originalQuery).then(seasonSummaries => {
//         if (
//           app.state.kind === StateType.SearchForSeason &&
//           app.state.isLoading &&
//           app.state.query === originalQuery
//         ) {
//           app.setState({
//             ...state,
//             isLoading: false,
//             seasons: Option.some(seasonSummaries),
//           });
//         }
//       });
//     },
//     viewSeason,
//   };
// };

// export default searchForSeasonController;
