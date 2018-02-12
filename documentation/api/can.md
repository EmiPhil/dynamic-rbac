# .can

The .can method is the bread and butter of lonamic. By default, `can` **returns a promise.** This encourages developers to use the same coding style for all roles, and allows the developer to ignore whether some role is implemented with concurrency or not.

Like everything in lonamic, `can` can be customized by passing in a .canHandler function into the acl constructor. (To see an example of this, look at the source of core.js. Internally, lonamic passes the `can` method to lonamic in the exact same way you would if you made a custom function.)

First, let's define a simple acl to show the functionality of `can`:

```js
const Lonamic = require('lonamic').lonamic

const roles = {
  'user': {
    can: ['posts:read']
  },
  'author': {
    can: [{
      name: 'posts:edit',
      when ({ params }, next) {
        setTimeout(() => {
          // fake concurrency
          next(null, params.post.author.id === params.author.id)
        })
      }
    }],
    inherits: ['user']
  }
}

const lonamic = Lonamic(roles)

const posts = [
  { author: { id: '1' } },
  { author: { id: '2' } }
]

const authors = [
  { id: '1' },
  { id: '2' }
]
```

The above acl defines two roles, `user` and `author`. Users can read posts, and authors can edit posts if they are the ones who wrote it, and inherit all user permissions. We also define some posts and authors to verify that lonamic is correctly discerning when an author can and cannot edit a post.

### Simple Can

For simple can methods, you can use the signature `lonamic.can(roleId, action)`, where actions are some permission defined in the acl:

```js
async function simpleCan() {
  const [a, b, c, d] = await Promise.all([
    lonamic.can('user', 'posts:read'), // true
    lonamic.can('user', 'posts:edit'), // false
    lonamic.can('user', 'undefined'), // false
    lonamic.can('author', 'posts:read') // true (via inheritance)
  ])
  console.log(a, b, c, d)
}

simpleCan()
```

### Complex (when) Can

For complex `can` methods, you should use the signature `lonamic.can(roleId, action, params)`:

```js
async function complexCan() {
  const [postA, postB] = posts
  const [authorA, authorB] = authors

  const [a, b, c, d] = await Promise.all([
    // true
    lonamic.can('author', 'posts:edit', { post: postA, author: authorA }),
    // true
    lonamic.can('author', 'posts:edit', { post: postB, author: authorB }),
    // false
    lonamic.can('author', 'posts:edit', { post: postA, author: authorB }),
    // false
    lonamic.can('author', 'posts:edit', { post: postB, author: authorA })
  ])

  console.log(a, b, c, d)
}

complexCan()
```

or, if you prefer the callback signature (`lonamic.can(roleId, action, params, cb)`):

```js
lonamic.can('author', 'posts:edit', {
  post: posts[0],
  author: authors[0]
}, function (err, can) {
  console.log(can) // true
})
```

### Full Example

```js
const Lonamic = require('lonamic').lonamic

const roles = {
  'user': {
    can: ['posts:read']
  },
  'author': {
    can: [{
      name: 'posts:edit',
      when({ params }, next) {
        setTimeout(() => {
          // fake concurrency
          next(null, params.post.author.id === params.author.id)
        }, 100)
      }
    }],
    inherits: ['user']
  }
}

const lonamic = Lonamic(roles)

const posts = [
  { author: { id: '1' } },
  { author: { id: '2' } }
]

const authors = [
  { id: '1' },
  { id: '2' }
]

async function simpleCan() {
  const [a, b, c, d] = await Promise.all([
    lonamic.can('user', 'posts:read'), // true
    lonamic.can('user', 'posts:edit'), // false
    lonamic.can('user', 'undefined'), // false
    lonamic.can('author', 'posts:read') // true (via inheritance)
  ])
  console.log(a, b, c, d)
}

simpleCan()

async function complexCan() {
  const [postA, postB] = posts
  const [authorA, authorB] = authors

  const [a, b, c, d] = await Promise.all([
    // true
    lonamic.can('author', 'posts:edit', { post: postA, author: authorA }),
    // true
    lonamic.can('author', 'posts:edit', { post: postB, author: authorB }),
    // false
    lonamic.can('author', 'posts:edit', { post: postA, author: authorB }),
    // false
    lonamic.can('author', 'posts:edit', { post: postB, author: authorA })
  ])

  console.log(a, b, c, d)
}

complexCan()

lonamic.can('author', 'posts:edit', {
  post: posts[0],
  author: authors[0]
}, function (err, can) {
  console.log(can) // true
})
```
