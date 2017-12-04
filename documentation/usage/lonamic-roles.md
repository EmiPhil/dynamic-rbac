# Lonamic Roles

Before we rebuild all of the functionality from the previous tutorial, lets start with the simplest actions in Lonamic: add roles objects, and retrieving ACLs.

### Adding Roles

Lonamic provides a sensible set of default functions for managing your roles \(also know as an Access Control List in our case\). To start:

```js
const Lonamic = require('lonamic').lonamic
let lonamic = Lonamic()
// from the previous series:
const roles = {
    user: {
        can: ['post:write'],
        inherits: ['guest']
    },
    guest: {
        can: ['post:read'],
        inherits: []
    }
}
```

There are three ways to add roles to lonamic:

##### 1: Using the default lonamic function

Adding a role to lonamic returns lonamic:

```js
lonamic = lonamic(roles)
lonamic.valueOf() // { user: { can: [ 'post:write' ], inherits: [ 'guest' ] }, guest: { can: [ 'post:read' ], inherits: [] } }

lonamic({ newRole: { can: [] } })
console.log(lonamic.roles.newRole) // undefined ?

// lonamic is pure!
lonamic = lonamic({ newRole: { can: ['ping'] } })
console.log(lonamic.roles.newRole) // { can: ['ping'] }
```

##### 2: Using the add method

Simple alias for the default function:

```js
lonamic = lonamic.add({ newRole: { can: ['pong'] } })
console.log(lonamic.roles.newRole) // { can: ['pong'] }
```

**Note that lonamic overwrote the previous role of the same name!**

##### 3: Using the default method

This can only be done on the initial construct:

```js
lonamic = Lonamic.default({ newRole: { can: ['ping'] } })
console.log(lonamic.roles.newRole) // { can: ['ping'] }
lonamic = lonamic.add({ newRole: { can: ['pong'] } })
console.log(lonamic.roles.newRole) // { can: ['ping'] }
```

## Retrieving ACLs

There are three ways to retrieve ACLs in Lonamic:

##### 1: Use the roles getter

Sugar for the valueOf method:

```js
lonamic = Lonamic.default({ newRole: { can: ['ping'] } })
lonamic = lonamic(roles)

console.log(lonamic.roles) // { newRole: { can: [ 'ping' ] }, user: { can: [ 'post:write' ], inherits: [ 'guest' ] }, guest: { can: [ 'post:read' ], inherits: [] } }
```

##### 2: Use the valueOf method

Alias of the roles getter:

```js
console.log(lonamic.valueOf()) // { newRole: { can: [ 'ping' ] }, user: { can: [ 'post:write' ], inherits: [ 'guest' ] }, guest: { can: [ 'post:read' ], inherits: [] } }
```

**Note that the roles getter and the valueOf method return all roles in the ACL including defaults**

##### 3: Use the defaults getter

This will return only the default roles:

```js
console.log(lonamic.defaults) // { newRole: { can: [ 'ping' ] } }
```

---

| [Previous](/usage/creating-roles.md) | [Next](/usage/can-user-x-do-action-y.md) |
| :--- | ---: |




