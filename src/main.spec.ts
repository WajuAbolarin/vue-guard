import { isPermitted } from "./main";
test("smoke test", () => {
  expect(isPermitted(["a"], ["b"], true)).toBeFalsy();
});
