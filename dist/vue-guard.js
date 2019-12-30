'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function PermissionPlugin(Vue, options) {
    if (options === void 0) { options = {}; }
    if (options.router) {
        addRouterGuards(options.router);
    }
    Vue.component("v-guard", {
        functional: true,
        props: {
            permissions: {
                type: [Array, String],
                default: function () { return []; }
            },
            all: {
                type: Boolean,
                default: false
            }
        },
        render: function (h, _a) {
            var props = _a.props, slots = _a.slots, rest = __rest(_a, ["props", "slots"]);
            var $getPermissions = rest.parent.$getPermissions;
            if (!$getPermissions) {
                console.error("[v-guard]", "v-guard must be a descendant of a component a permissions options");
            }
            var permissions = props.permissions, all = props.all;
            if (isPermitted($getPermissions() || [], permissions, all)) {
                return slots().default;
            }
            return h();
        }
    });
    Vue.mixin({
        beforeCreate: permissionsInit
    });
    function permissionsInit() {
        var options = this.$options;
        var permFn = getPropFromSelfOrAcenstor("permissions", options);
        if (!permFn) {
            return;
        }
        Vue.prototype.$getPermissions =
            typeof permFn === "function" ? permFn.bind(this) : function () { return permFn; };
        var perms = typeof permFn === "function" ? permFn.call(self) : permFn;
        Vue.prototype.$userPermissions = perms;
        Vue.prototype.$permitsAll = function permitsAll(permissions) {
            return isPermitted(perms, permissions, true);
        };
        Vue.prototype.$permitsAny = function permitsAll(permissions) {
            return isPermitted(perms, permissions, false);
        };
    }
    function addRouterGuards(router) {
        router.beforeResolve(function (to, from, next) {
            console.log("before resolve");
            var guard = to.meta && to.meta.guard;
            if (!guard) {
                return next();
            }
            var $getPermissions = Vue.prototype.$getPermissions;
            if (!$getPermissions) {
                var errorRoute = options.errorRoute;
                if (errorRoute) {
                    return next(errorRoute);
                }
                throw new Error("You need a 403 route now!");
            }
            var usersPermissions = $getPermissions();
            var permitIf = guard.permitIf, permissions = guard.permissions, _a = guard.all, all = _a === void 0 ? true : _a;
            if (permitIf) {
                permitIf() && next();
                return;
            }
            if (!isPermitted(usersPermissions, permissions, all)) {
                return next(from);
            }
            return next();
        });
    }
}
function isPermitted(usersPermissions, permissions, all) {
    if (!permissions || !usersPermissions) {
        throw new Error("isPermitted called without proper arguments");
    }
    permissions = Array.isArray(permissions)
        ? permissions
        : permissions.trim().split(",");
    var intersection = permissions.reduce(function (intersect, perm) {
        if (!usersPermissions.map(function (s) { return s.trim(); }).includes(perm.trim())) {
            return intersect;
        }
        if (!intersect.includes(perm.trim())) {
            intersect.push(perm);
        }
        return intersect;
    }, []);
    return all
        ? intersection.length >= permissions.length
        : intersection.length > 0;
}
function getPropFromSelfOrAcenstor(prop, config) {
    if (config[prop]) {
        return config[prop];
    }
    if (config.parent) {
        return getPropFromSelfOrAcenstor(prop, config.parent);
    }
    return null;
}

exports.default = PermissionPlugin;
exports.isPermitted = isPermitted;
