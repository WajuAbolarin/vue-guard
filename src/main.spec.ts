import { isPermitted } from "./main";
let Permissions = {
  CREATE: "create apps",
  VIEW: "view apps",
  EDIT: "edit apps",
  DELETE: "delete apps"
};
let usersPermissions = [Permissions.CREATE, Permissions.VIEW];
test("smoke test", () => {
  expect(isPermitted(usersPermissions, [Permissions.DELETE], true)).toBeFalsy();
  expect(isPermitted(usersPermissions, [Permissions.VIEW], true)).toBeTruthy();
});
