# Editing Own Post

To conceptualize the use case where we authorise a user to execute some action if, and only if, some other parameter returns in a specific way, you should think about an application where a user can edit their own content, but not others. This is a great use case because it is so common, and it shows that the construct

```js
const editPostRole = {
    can: ['post:edit']
}
```

is not enough. Lonamic would read that and return true for _all_ posts! To behave how we want, we need to explicitly tell Lonamic when a user should be authorised to execute the action.

#### Post Database

But first, we need some posts to play with. Let's start by making a new database!

```js
function PostDatabase () {
  function database (db) {
    const add = (id = '1', details = {}) => {
      // async to immitate real io
      return new Promise(resolve => {
        let entry = Object.assign({}, details, { id: id })
        setTimeout(() => {
          resolve(database(
            Object.assign({}, db, { [id]: entry })
          ))
        }, 100)
      })
    }

    return Object.assign(add, {
      add, // allows default call or explicit .add
      getPost (id) {
        // async to immitate real io
        return new Promise (resolve => {
          setTimeout(() => {
            resolve(db[id])
          }, 100)
        })
      }
    })
  }

  // helpers - curried for promise sugar power
  const add = (id, details) => (db) => db.add(id, details)
  const getPost = (id) => (db) => db.getPost(id)

  // init via default func, helpers in methods
  return Object.assign(database, { add, getPost })
}

const db = PostDatabase()
```

Don't worry too much about the implementation, this is just to supplement learning Lonamic! If you are in an environment that does not yet support the Promise keyword, you will need to polyfill it somehow for the above to work.

Lonamic set up with our starter roles:

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

And some users, this time with ids and a name property:

```js
const users = {
  1: {
    name: 'Jane',
    role: 'user'
  },
  2: {
    name: 'Bob',
    role: 'user'
  },
  3: {
    name: undefined,
    role: 'guest'
  }
}
```

##### Interacting With The Database

Before we continue, let's look at how we interact with our database:

```js
db().add('post id', { by: 'user id', title: 'title', body: 'text' })
  .then(db => console.log(db.toString())) // { 'post id': { by: 'user id', title: 'title', body: 'text', id: 'post id' } }
```

There is also a syntactic sugar for chaining adds and logs:

```js
db().add(postId++, { by: 1, title, body })
  .then(db.add(postId++, { by: 2, title, body }))
  .then(db.log) // { '0': { by: 1, title: 'Title', body: 'Text.', id: 0 }, '1': { by: 2, title: 'Title', body: 'Text.', id: 1 } }
  .then(db.add(postId++, { by: 1, title, body }))
  // ...etc
  .then(db.log) // { '0': { by: 1, title: 'Title', body: 'Text.', id: 0 }, '1': { by: 2, title: 'Title', body: 'Text.', id: 1 }, '2': { by: 1, title: 'Title', body: 'Text.', id: 2 } }
```

To get a particular post \(this method does not return the db, so cannot be chained\):

```js
db().add(1, { by: 1, title, body })
  .then(db.getPost(1))
  .then(console.log) // { by: 1, title: 'Title', body: 'Text.', id: 1 }
```



