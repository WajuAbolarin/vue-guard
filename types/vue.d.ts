import Vue, {
  ComponentOptions,
  DefaultData,
  DefaultMethods,
  DefaultComputed
} from "vue/types";

import { RouterConfig } from "vue-router/types";
declare module "vue/types/options" {
  interface ComponentOptions<
    V extends Vue,
    Data = DefaultData<V>,
    Methods = DefaultMethods<V>,
    Computed = DefaultComputed,
    PropsDef = PropsDefinition<DefaultProps>,
    Props = DefaultProps
  > {
    permissions?: () => Array<string> | string;
  }
}
declare module "vue-router/types/router" {
  interface RouteConfig {
    meta?:
      | {
          guard: {
            permisssions: Array<string>;
            all?: boolean;
          };
        }
      | any;
  }
}
declare module "vue/types/vue" {
  interface Vue {
    $permitsAny: (permissions: Array<string>) => boolean;
    $permitsAll: (permissions: Array<string>) => boolean;
    $getPermissions: () => Array<string>;
  }
}
