import { StubbableApi } from "../src/api/StubbableApi";

export default function disableAllApiFunctions(api: StubbableApi): void {
  api.getAllFunctionIds().forEach(id => {
    api.override(id, function disabledApiFunction() {
      throw new Error("`api." + id + "()` has been disabled for testing.");
    });
  });
}
