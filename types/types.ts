import VueRouter from "vue-router/types";
export interface VueGuardOptions {
  router?: VueRouter;
  errorRoute?: string;
}
export declare type Permissions = Array<string> | string;
