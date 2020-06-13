# Vue-Guard
 > Authorization utilities for Vue 2 JS Apps.
 
## Installation
 ```
 $ yarn add @waju/vue-guard
 ```
 
 ## Setup
 ```
 import Permissions from "@waju/vue-gaurd"
 
 Vue.use(Permissions, { router, errorRoute: "/403" });
 new Vue({
  router,
  //Provide a data or function member of your root component named `permissions` which returns the user's permissions.
  permissions() {
    return this.$store.getters.userPermissions;
  },
  render: h => h(App),
 ...// other options
}).$mount('#app')
```
## API
To guard a component tree, or say button
 ```
 //permissions here are the required permissions
 <v-guard :permissions="['is-admin', 'can-view-posts']">
  <SomeComponent />
 </v-guard>
```

To guard Vue-Router routes
```
const routes = [
 {
  path: ':id/edit',
  name: 'EditPost',
  meta: { 
    guard: {
      permissions: ['edit-posts', 'manage-posts'],
      all: true
    },
 }
]
```
For imperative logic two methods are injected into every component 
- `$permitsAny` takes an array of permissions and returns true if the user has *any* of those permissions
- `$permitsAll` takes an array of permissions and returns true if the user has *all* of those permissions.

## Contributing
Please use this library and open issues if you find any bugs, also feel free to submit PR's with fixes, improvements and new features.
