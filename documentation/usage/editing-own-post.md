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
const users = [
  {
    id: 1,
    name: 'Jane',
    role: 'user'
  }, {
    id: 2,
    name: 'Bob',
    role: 'user'
  }, {
    id: 3,
    name: undefined,
    role: 'guest'
  }
]
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

### Create Some Posts

Now that we understand how to interact with our database, let's make a few posts:

```js
let postId = 0
db()() // :)
.then(db.add(postId++, { by: 1, title: 'Lonamic', body: 'Is the best.' }))
.then(db.add(postId++, { by: 1, title: 'Jane', body: 'Loves Lonamic.' }))
.then(db.add(postId++, { by: 2, title: 'Roles', body: 'Can be simple!' }))
.then(db.add(postId++, { by: 2, title: 'Bob', body: 'Master of roles.' }))
.then(db.log)
.then(db => {
  // This is the current db!
})
```

### Connecting Lonamic

Now we have a collection of posts, each having a by property that references the user id that created the post. Next, let's create a function that, given the db, a post id, and a user id, returns a Promise which resolves to false if the user id does not match the post id, or  resolves the post if it does:

```js
function getUserPost (db, postId, userId) {
  return new Promise((resolve) => {
    db.getPost(postId).then(post => {
      if (post.by === userId) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
```

We are almost done. Next, lets remake our user role to support maybe authorisation:

```js
const userRole = {
  can: [
    'post:write',
    {
      name: 'post:edit',
      when ({ params }, next) {
        const { db, postId, userId } = params
        getUserPost(db, postId, userId)
          .then(isAuthorised => next(null, isAuthorised))
      }
    }
  ],
  inherits: ['guest']
}


lonamic = lonamic({ user: userRole }) // remember that lonamic will overwrite previous roles of the same id
```

When defining conditional cans, Lonamic expects an object with the name of the permission and a when function. The when function is passed an object with one prop params, which contains some user-provided information, along with the role id and a canDo object of everything that role can do, and a next callback. Because Lonamic assumes async as default, you can create complicated io logic flows inside the when function. Simply call the next callback with \(err, boolean\) when you are ready!

Now, inside the last then of the post creation:

```js
...
.then(db => {
  const [jane, bob, guest] = users
  // Lets us track the async calls better
  const log = (id) => (result) => console.log(`${id}: ${result}`)
  //                                  These are the params passed to .when
  lonamic.can(jane.role, 'post:edit', { db, postId: 0, userId: jane.id }).then(log('Jane 0')) // Jane 0: true
  lonamic.can(jane.role, 'post:write').then(log('Jane 1')) // Jane 1: true
  lonamic.can(jane.role, 'post:read').then(log('Jane 2')) // Jane 2: true
  lonamic.can(jane.role, 'post:edit', { db, postId: 2, userId: jane.id }).then(log('Jane 3')) // Jane 3: false, that is Bob's post!

  lonamic.can(bob.role, 'post:edit', { db, postId: 0, userId: bob.id }).then(log('Bob 0')) // Bob 0: false, that is Jane's post!
  lonamic.can(bob.role, 'post:edit', { db, postId: 2, userId: bob.id }).then(log('Bob 1')) // Bob 1: true

  lonamic.can(guest.role, 'post:read').then(log('Guest 0')) // Guest 0: true
  lonamic.can(guest.role, 'post:write').then(log('Guest 1')) // Guest 1: false
  lonamic.can(guest.role, 'post:edit', { db, postId: 1, userId: guest.id }).then(log('Guest 2')) // Guest 2: false
  lonamic.can(guest.role, 'post:edit').then(log('Guest 3')) // Guest 3: false
})
```

### All Together:

```js
const Lonamic = require('lonamic').lonamic

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
      // allows a quick read of the db
      toString () { return db },
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
  const log = (db) => {
    return new Promise (resolve => {
      console.log(db.toString())
      resolve(db)
    })
  }

  // init via default func, helpers in methods
  return Object.assign(database, { add, getPost, log })
}

const db = PostDatabase()

function getUserPost (db, postId, userId) {
  return new Promise((resolve) => {
    db.getPost(postId).then(post => {
      if (post.by === userId) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

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

const users = [
  {
    id: 1,
    name: 'Jane',
    role: 'user'
  }, {
    id: 2,
    name: 'Bob',
    role: 'user'
  }, {
    id: 3,
    name: undefined,
    role: 'guest'
  }
]

const userRole = {
  can: [
    'post:write',
    {
      name: 'post:edit',
      when ({ params }, next) {
        const { db, postId, userId } = params
        getUserPost(db, postId, userId)
          .then(isAuthorised => next(null, isAuthorised))
      }
    }
  ],
  inherits: ['guest']
}

// Reassign the user role!
lonamic = lonamic({ user: userRole })

// Create some posts and test permissions
postId = 0
db()()
.then(db.add(postId++, { by: 1, title: 'Lonamic', body: 'Is the best.' }))
.then(db.add(postId++, { by: 1, title: 'Jane', body: 'Loves Lonamic.' }))
.then(db.add(postId++, { by: 2, title: 'Roles', body: 'Can be simple!' }))
.then(db.add(postId++, { by: 2, title: 'Bob', body: 'Master of roles.' }))
.then(db.log)
.then(db => {
  const [jane, bob, guest] = users
  // Lets us track the async calls better
  const log = (id) => (result) => console.log(`${id}: ${result}`)
  //                                  These are the params passed to .when
  lonamic.can(jane.role, 'post:edit', { db, postId: 0, userId: jane.id }).then(log('Jane 0')) // Jane 0: true
  lonamic.can(jane.role, 'post:write').then(log('Jane 1')) // Jane 1: true
  lonamic.can(jane.role, 'post:read').then(log('Jane 2')) // Jane 2: true
  lonamic.can(jane.role, 'post:edit', { db, postId: 2, userId: jane.id }).then(log('Jane 3')) // Jane 3: false, that is Bob's post!

  lonamic.can(bob.role, 'post:edit', { db, postId: 0, userId: bob.id }).then(log('Bob 0')) // Bob 0: false, that is Jane's post!
  lonamic.can(bob.role, 'post:edit', { db, postId: 2, userId: bob.id }).then(log('Bob 1')) // Bob 1: true

  lonamic.can(guest.role, 'post:read').then(log('Guest 0')) // Guest 0: true
  lonamic.can(guest.role, 'post:write').then(log('Guest 1')) // Guest 1: false
  lonamic.can(guest.role, 'post:edit', { db, postId: 1, userId: guest.id }).then(log('Guest 2')) // Guest 2: false
  lonamic.can(guest.role, 'post:edit').then(log('Guest 3')) // Guest 3: false
})
```

In the next article, we will take this example one step further and explore the last default feature of Lonamic, filter.

Another reminder that, if you do not agree with the default implementation of .can, you can easily replace it with a more suitable specification!

---

| [Previous](/usage/can-user-x-do-action-y.md) | [Next](/usage/filtering-requests.md) |
| :--- | ---: |




