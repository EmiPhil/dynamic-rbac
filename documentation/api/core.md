# .core

The `core` of lonamic exports two functions, `acl` and `lonamic`. The `lonamic` export is essentially sugar for calling the `acl` with default options, and should be used in the majority of cases:

```js
const Lonamic = require('lonamic').lonamic
```

Calling the acl instead requires you to define your own functions, which is only recommended for advanced users:

```js
const Lonamic = require('lonamic').acl({
  hydrator () {},
  canHandler () {},
  filterHandler () {}
})
```

Internally, lonamic will assign those functions to lonamic.hydrate, lonamic.can, and lonamic.filter. This is actually the way that lonamic assigns the default functions!

Note that some functions use others, so it is important to run your own tests if you decide to customize these functions. For instance, calling .filter will run the canHandler over the requested actions.

The rest of the documentation assumes you are using the defaults.

## Basic Usage

At it's core, lonamic is all about creating and using an acl, which is stored as an internal object. Here is a sample definition:

```js
const Lonamic = require('lonamic').lonamic

const roles = {
  'roleName': {
    can: ['permissionName']
  },
  'anotherRole': {
    inherits: ['roleName']
  },
  'complexRole': {
    can: [{
      name: 'permissionName',
      when ({ params }, next) {
        // add your own logic in here via passed-through params (see the documentation for .can)
        next(Error, Boolean)
        // cb pattern, if there are no errors, pass either true (the role can do the action) or false
      }
    }],
    inherits: ['anotherRole']
  }
}

let lonamic = Lonamic(roles)
```

## API

### .add()

`lonamic.add(roleDefinition = {})` or `lonamic(roleDefinition = {})`

The `add` method assigns a new role to the internal acl, then returns lonamic. Since add is also the default function, calling lonamic with no arguments returns a copy of itself. This allows **dynamic** role definitions:

```js
const Lonamic = require('lonamic').lonamic

let lonamic = Lonamic()

lonamic = lonamic({ 'newRole': { can: ['perm'] }})
lonamic = lonamic.add({ 'newRole2': { can: ['perm2'] }})

// { newRole: { can: ['perm'] }, newRole2: { can: ['perm2'] } }
console.log(lonamic.valueOf())
```

Later roles will override earlier ones:

```js
let lonamic = require('lonamic').lonamic()

lonamic = lonamic({ 'role': { can: [] }})
lonamic = lonamic({ 'role': { can: ['perm'] }})

// { role: { can: ['perm'] } }
console.log(lonamic.valueOf())
```

Returning a copy of itself on changes is a great way to keep your acl pure, but be careful not to make method calls to outdated versions of the acl!

### .valueOf()

`lonamic.valueOf()`

Return the acl object, including both default and non default roles.

### .roles

`lonamic.roles`

Equivalent to `valueOf`
### .defaults

`lonamic.defaults`

Getter prop that returns default roles (see below)

### .role()

`lonamic.role(roleId = '')`

Returns a specific role by id:

```js
const lonamic = require('lonamic').lonamic({ 'roleId': { can: [] } })

// { can: [] }
console.log(lonamic.role('roleId'))
```

### .hydrator

`lonamic.hydrator`

Returns the actual hydrator object, without executing the hydration cycle. Not typically required.

### .hydrate()

`lonamic.hydrate(roleId = '')`

Hydrates (expands all inheritance) of a given role. See the docs for [.inheritance](/api/inheritance.md).

### .can()

`lonamic.can(roleId = '', action = '', params = {}, cb = () => {} )`

Checks if role x can do action y. See the docs for [.can](/api/can.md).

### .filter()

`lonamic.filter(roleId = '', actions = [''], cb = () => {}, keys = {})`

Filters a collection of actions based on a role. See the docs for [.filter](/api/filter.md).

### .encode()

`lonamic.encode()`

Returns a buffer for db storage. Preserves default roles.

### .constructor

`lonamic.constructor(roles = {}, defaults = {}, { rbacl = {} })`

or

`lonamic.constructor`

Used to access the lonamic constructor. (lonamic.constructor() === lonamic):

```js
let lonamic = require('lonamic').lonamic({ 'roleId': { can: [] } })

lonamic = lonamic.constructor()

// {}
console.log(lonamic.valueOf())

// undefined
console.log(lonamic.of)

// [Function]
console.log(lonamic.constructor.of)
```

## Constructor methods
### .of()

`lonamic.constructor.of(acl = {})`

Used to define a new lonamic object with a given acl (can reconstruct lonamic from the output of lonamic.valueOf, but will lose role defaults)

```js
const Lonamic = require('lonamic').lonamic

let lonamic = Lonamic({ 'role': { can: ['perm'] } })

const acl = lonamic.valueOf()

lonamic = Lonamic.of(acl)
// or:
// lonamic = lonamic.constructor.of(acl)

// { role: { can: [ 'perm' ] } }
console.log(lonamic.valueOf())
```

### .hydrateOf()

`lonamic.constructor.hydrateOf(acl = {}, roleId = '')`

Equivalent to `lonamic.constructor.of(acl = {}).hydrate(roleId = '').res`

### .default()

`lonamic.constructor.default(defaults = {}, acl = {})`

Used to define default roles. Default roles cannot be overridden by .add:

```js
const Lonamic = require('lonamic').lonamic

let lonamic = Lonamic({ 'role': { can: ['perm'] } })

const acl = lonamic.valueOf()

lonamic = Lonamic.default({ 'role': { can: ['default'] } }, acl)

// { role: { can: [ 'default' ] } }
console.log(lonamic.valueOf())

lonamic = lonamic({ 'role': { can: [''] } })

// { role: { can: [ 'default' ] } }
console.log(lonamic.valueOf())
```

### .decode()

`lonamic.decode(buffer)`

Decodes a buffer created from `lonamic(roles = {}).encode()` and returns a lonamic instance.
