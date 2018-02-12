# .hydrate

The .hydrate method is used to create an object of all priviledges a role has, including those it inherits, recursively. Internally, lonamic uses `hydrate` whenever the `can` or `filter` methods are used, so you would not typically need to execute hydration cycles yourself.

First, let's define a simple acl to show the functionality of `hydrate`:

```js
const Lonamic = require('lonamic').lonamic

const roles = {
  'top': {
    can: ['a'],
    inherits: ['mid']
  },
  'mid': {
    can: ['b'],
    inherits: ['bot']
  },
  'bot': {
    can: ['c']
  }
}

const lonamic = Lonamic(roles)
```

The above acl defines three roles, `top`, `mid`, and `bot`. `mid` inherits from `bot`, and `top` inherits from `mid`.

## Basic Usage

Calling `lonamic.hydrate(roleId)` will call itself until all levels of inheritance have been hydrated:

```js
const roleIds = Object.keys(roles)

roleIds.forEach(roleId => {
  const hydratedRole = lonamic.hydrate(roleId)
  console.log(hydratedRole.res)
  // roleId: 'top':
  // { incl: ['top', 'mid', 'bot'], can: ['a', 'b', 'c'] }

  // roleId: 'mid':
  // { incl: ['mid', 'bot'], can: ['b', 'c'] }

  // roleId: 'bot':
  // { incl: ['bot'], can: ['c'] }
})
```

The resulting object from calling `lonamic.hydrate(roleId)` is defined below.

## API

The api refers to the hydrated object returned after the hydration process is completed.

### .valueOf()

`lonamic.hydrate(roleId = '').valueOf()`

Returns an object with the following signature:

```js
{
  'incl': [''], // a list of all roles that the hydrated role includes
  'can': [''] // a list of all permissions the role has after hydration
}
```

### .toString()

`lonamic.hydrate(roleId = '').toString()`

Returns a stringified description of the role:

```js
console.log(
  lonamic.hydrate('mid').toString()
) // rbacl[mid] => {"incl":["mid","bot"],"can":["b","c"]}
```

### .res

`lonamic.hydrate(roleId = '').res`

Equivalent to `.valueOf()`

### .target

`lonamic.hydrate(roleId = '').target`

Getter method that returns the initial roleId:

```js
console.log(
  lonamic.hydrate('mid').target
) // mid
```

### .cycles

`lonamic.hydrate(roleId = '').cycles`

Getter method that returns the cycles it took to hydrate the role:

```js
console.log(
  lonamic.hydrate('top').cycles
) // 3

console.log(
  lonamic.hydrate('mid').cycles
) // 2
```

### .keyword

`lonamic.hydrate(roleId = '').keyword`

Getter method that returns the keyword used for hydration. This can be customized in the creation of the lonamic object, and in the inheritance object exported in the default inheritance function.

```js
console.log(
  lonamic.hydrate('mid').keyword
) // inherits
```

## Infinite Cycles

The hydration method protects you from circular inheritance, but you should still avoid defining circular inheritance.

```js
const Lonamic = require('lonamic').lonamic

const roles = {
  'a': { inherits: ['b'] },
  'b': { inherits: ['c'] },
  'c': { inherits: ['a'] }
}

const lonamic = Lonamic(roles)

const hydratedRole = lonamic.hydrate('a')

console.log(hydratedRole.cycles) // 3
console.log(hydratedRole.res) // { incl: ['a', 'b', 'c'], can: [] }
```
