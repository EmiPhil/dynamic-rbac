# Creating Roles

To show how lonamic helps you manage roles, lets start by building out a role system without Lonamic

### Cycle 1

Let's say that you are looking to bring autorisation into an application. In your application, there are two types of uses: privledged and guest. This is a common pattern in applications that are open for guests to browse and interact with content, but require a user to create an account to generate new content. \(Think of services like Reddit\).

Perhaps you create a role object that looks something like this:

```js
const roles = {
    user: ['make_new_post', 'browse_posts'],
    guest: ['browse_posts']
}
```

You would then the guest role to people who are not signed in, and the user role to all account holders:

```js
function userIsLoggedIn ( ... ) {
    // Find out somehow
    return (true || false)
}

if (userIsLoggedIn()) {
    user.role = 'user'
} else {
    user.role = 'guest'
}
```

Finally, to see if the user has the authority to execute a given action:

```js
function hasAuthority (userRole, action) {
    if (roles[userRole].includes(action)) {
        return true
    } else {
        return false
    }
}
```

All together:

```js
const roles = {
    user: ['make_new_post', 'browse_posts'],
    guest: ['browse_posts']
}

function hasAuthority (userRole, action) {
    if (roles[userRole].includes(action)) {
        return true
    } else {
        return false
    }
}

const user = { role: 'user' }
const guest = { role: 'guest' }

hasAuthority(user.role, 'make_new_post') // true
hasAuthority(user.role, 'browse_posts') // true

hasAuthority(guest.role, 'make_new_post') // false
hasAuthority(guest.role, 'browse_posts') // true
```

So far so good. Our application correctly discerns guests from users, and does not allow a guest to execute a post action. But notice that the `user` role is really a set of roles that contains the `guest` set and some priviledged set of roles:

```js
const userSet = [...guestSet, ...priviledgedSet]
```

For our application, this is hardly noticable. But as we add to the list of things a `guest` can do, our application will  continuously violate DRY principles.

### Cycle 2

Let's make our role definitions DRY:

```js
const roles = {
    user: {
        can: ['make_new_post'],
        inherits: ['guest']
    },
    guest: {
        can: ['browse_posts'],
        inherits: []
    }
}
```

What this code says is that the role `user` CAN \(has the authority to\) make new posts and INHERITS the `guest` role which CAN browse posts. Let's create a new function to hydrate our inheritance model:

```js
function hydrate (role) {
  let can = []
  // Get the initial authorized actions
  can = can.concat(roles[role].can)
  // Hydrate inheritance
  const inherits = roles[role].inherits
  if (inherits.length > 0) {
    inherits.forEach((role) => {
      can = can.concat(hydrate(role))
    })
  }
  // Do not return duplicates
  can = can.reduce((acc, cur) => {
    if (!acc.includes(cur)) {
      acc = acc.concat([ cur ])
    }
    return acc
  }, [])

  return can
}
```

Don't worry if you do not follow the hydrate function completely. The important part is that given a role object, the hydrate function will find all of the actions the role, and any role it inherits, is authorised to perform, and return them as an array:

```js
hydrate(user.role)
// ['make_new_post', 'browse_posts']
```

To check for authorisation:

```js
function hasAuthority (role, action) {
  if (hydrate(role).includes(action)) {
    return true
  } else {
    return false
  }
}

hasAuthority(user.role, 'make_new_post') // true
hasAuthority(user.role, 'browse_posts') // true

hasAuthority(guest.role, 'make_new_post') // false
hasAuthority(guest.role, 'browse_posts') // true
```

Looking good! Our next step is to consider what would happen if our application had hundreds of actions. Our current naming methodolgy is not scaleable \(was it make new post or make new posts?\). One method that can work well at scale is the `object:action` style:

```js
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

All together:

```js
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

function hydrate (role) {
  let can = []
  // Get the initial authorized actions
  can = can.concat(roles[role].can)
  // Hydrate inheritance
  const inherits = roles[role].inherits
  if (inherits.length > 0) {
    inherits.forEach((role) => {
      can = can.concat(hydrate(role))
    })
  }
  // Do not return duplicates
  can = can.reduce((acc, cur) => {
    if (!acc.includes(cur)) {
      acc = acc.concat([ cur ])
    }
    return acc
  }, [])

  return can
}

function hasAuthority (role, action) {
  if (hydrate(role).includes(action)) {
    return true
  } else {
    return false
  }
}

const user = { role: 'user' }
const guest = { role: 'guest' }

hasAuthority(user.role, 'post:write') // true
hasAuthority(user.role, 'post:read') // true

hasAuthority(guest.role, 'post:write') // false
hasAuthority(guest.role, 'post:read') // true
```

### Next Steps

You could keep developing the role system we have created so far, but all of the features above and more are available to you in Lonamic, so let's see what our application would look like using Lonamic!

If you are a die hard dev and want to work out some more use cases, here are a few suggestions:

* Only allowing users to post:edit their own posts
* Adding more roles in a programmatic way \(for example, if you receive role definitions from a database\)
* Making authorisation checks asynchronus

---

| [Previous](/usage.md) | [Next](/usage/lonamic-roles.md) |
| :--- | ---: |




