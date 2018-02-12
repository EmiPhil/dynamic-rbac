# Can

This reference assumes that you are using the default can function that ships with Lonamic. If you have developed your own can function, you will need to reference that for more details!

### Can User X Do Action Y

As we saw in the [Creating Roles](/usage/creating-roles.md) section, fetching User X is outside the scope of these tutorials. For our purposes, we will assume that somehow you have the user:

```js
const user = { role: 'user' }
const guest = { role = 'guest' }
```

And of course our acl definition:

```js
const Lonamic = require('lonamic').lonamic

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

let lonamic = Lonamic(roles)
```

Great. Using lonamic, we can easily check to see if our guest user can write a post:

```js
console.log(lonamic.can(guest.role, 'post:write')) // Promise { false }
```

Huh. That's not quite what we expected. What is that Promise keyword doing in there? As it turns out, the default Can method in Lonamic returns a promise! This allows us to create some pretty neat things without breaking too much of a sweat. For now, rewrite the above like so:

```js
lonamic.can(guest.role, 'post:write')
  .then(can => {
    console.log(can) // false
  })
```

Or, if you are on the bleeding edge:

```js
async function main() {
    const can = await lonamic.can(guest.role, 'post:write')
    console.log(can) // false
}

main()
```

Or, if you hate promises:

```js
lonamic.can(guest.role, 'post:write', (err, can) => {
  console.log(can) // false
})
```

The important thing to note is that Lonamic does not return the answer directly. You should use the promise interface whenever possible, but Lonamic supports the Callback interface via the common \(err, result\) signature wherever a promise might be returned.

### What About Inheritance?

We still haven't remade that big ugly hydrate function from the first tutorial. Where do we put our hydrator in this Can function?

```js
lonamic.can(user.role, 'post:read').then(console.log) // true
```

Whoa.

The inheritance pattern is so common that, by default, Lonamic will pre-hydrate calls by calling lonamic.hydrate. Of course, just like the Can method, you can also pass in your own Hydrator!

If you would like to directly hydrate a role:

```js
hydrated = lonamic.hydrate('user')
console.log(hydrated.toString()) // rbacl[user] => {"incl":["user","guest"],"can":["post:write","post:read"]}
console.log(hydrated.target) // user
console.log(hydrated.res) // { incl: [ 'user', 'guest' ], can: [ 'post:write', 'post:read' ] }
```

### Next Steps

So far we have finished 2 of the three challenges at the bottom of [Creating Roles](/usage/creating-roles.md). In the [previous article](/usage/lonamic-roles.md), we discovered how to dynamically add roles to our acl \(lonamic returns lonamic on add!\). In this article, we have seen that, by default, calls to our internal lonamic functions return promises. This mindset allows us to bring in asynchronus calls to our system later, without worrying about it now.

Next, let's tackle post edits.
