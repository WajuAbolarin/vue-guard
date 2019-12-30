import Vue, { VueConstructor, ComponentOptions } from "vue/types";

import VueRouter, { RouteRecord } from "vue-router/types";

import { VueGuardOptions, Permissions } from "../types/types";
function PermissionPlugin(
  Vue: VueConstructor,
  options: VueGuardOptions = {}
): void {
  if (options.router) {
    addRouterGuards(options.router);
  }
  Vue.component("v-guard", {
    functional: true,
    props: {
      permissions: {
        type: [Array, String],
        default: () => []
      },
      all: {
        type: Boolean,
        default: false
      }
    },
    render(h, { props, slots, ...rest }) {
      let { $getPermissions } = rest.parent;
      if (!$getPermissions) {
        console.error(
          `[v-guard]`,
          `v-guard must be a descendant of a component a permissions options`
        );
      }
      const { permissions, all } = props;

      if (
        isPermitted($getPermissions() || [], permissions as Permissions, all)
      ) {
        return slots().default;
      }
      return h();
    }
  });

  Vue.mixin({
    beforeCreate: permissionsInit
  });

  function permissionsInit(this: Vue) {
    const options = this.$options;
    let permFn = getPropFromSelfOrAcenstor("permissions", options);
    if (!permFn) {
      return;
    }
    Vue.prototype.$getPermissions =
      typeof permFn === "function" ? permFn.bind(this) : () => permFn;
    let perms = typeof permFn === "function" ? permFn.call(self) : permFn;
    Vue.prototype.$userPermissions = perms;

    Vue.prototype.$permitsAll = function permitsAll(permissions: Permissions) {
      return isPermitted(perms, permissions, true);
    };
    Vue.prototype.$permitsAny = function permitsAll(permissions: Permissions) {
      return isPermitted(perms, permissions, false);
    };
  }

  function addRouterGuards(router: VueRouter) {
    router.beforeResolve(
      (to: RouteRecord, from: RouteRecord, next: Function) => {
        console.log(`before resolve`);
        const guard = to.meta && to.meta.guard;
        if (!guard) {
          return next();
        }
        const { $getPermissions } = Vue.prototype;
        if (!$getPermissions) {
          let { errorRoute } = options;
          if (errorRoute) {
            return next(errorRoute);
          }
          throw new Error("You need a 403 route now!");
        }

        const usersPermissions = $getPermissions();
        const { permitIf, permissions, all = true } = guard;

        if (permitIf) {
          permitIf() && next();
          return;
        }

        if (!isPermitted(usersPermissions, permissions, all)) {
          return next(from);
        }
        return next();
      }
    );
  }
}
function isPermitted(
  usersPermissions: Array<string>,
  permissions: Permissions,
  all: boolean
) {
  if (!permissions || !usersPermissions) {
    throw new Error(`isPermitted called without proper arguments`);
  }
  permissions = Array.isArray(permissions)
    ? permissions
    : permissions.trim().split(",");

  let intersection = permissions.reduce(
    (intersect: Array<string>, perm: string) => {
      if (
        !usersPermissions.map((s: string) => s.trim()).includes(perm.trim())
      ) {
        return intersect;
      }
      if (!intersect.includes(perm.trim())) {
        intersect.push(perm);
      }
      return intersect;
    },
    []
  );
  return all
    ? intersection.length >= permissions.length
    : intersection.length > 0;
}

function getPropFromSelfOrAcenstor(
  prop: string,
  config: ComponentOptions
): Function | null {
  if (config[prop]) {
    return config[prop];
  }
  if (config.parent) {
    return getPropFromSelfOrAcenstor(prop, config.parent);
  }
  return null;
}

export default PermissionPlugin;
export { isPermitted };
