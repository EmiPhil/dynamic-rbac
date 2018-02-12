# Filtering Requests

Since we only allow our user to edit their own posts, it might be useful to return all the posts a user can edit from a given collection of posts. Lonamic provides a filter method that can be used to solve that problem.

### Filter

The lonamic filter method takes in a role id and an array of requests. Think of the array requests and a list of questions: can the user do a, b, c, ..., n? Lonamic will answer each request, and return only the requests that passed:

```js
const reqs = [
  'post:write',
  'post:read'
]

lonamic.filter('user', reqs).then(passed => {
  console.log('User can do: ' + passed.join(', '))
  // User can do: post:write, post:read
})

lonamic.filter('guest', reqs).then(passed => {
  console.log('Guest can do: ' + passed.join(', '))
  // Guest can do: post:read
})
```

For requests that use the conditional can from the previous article, filter expects an object with a name and a rest array of arguments to pass to the when function. Using the rest array allows users to define their own Can method and still be able to use the default filter function, by passing in the required arguments to the rest property.

For our case, this looks like:

```js
const reqs = [
  'post:write',
  'post:read'
]

reqs.push({
  name: 'post:edit',
  rest: [{ // these are passed to the when param!
    db: db({ 1: { by: 1 }}),
    userId: 1,
    postId: 1
  }]
})

lonamic.filter('user', reqs).then(passed => {
  console.log('User can do: ' + passed.join(', '))
  // User can do: post:write, post:read, [object Object]
})

lonamic.filter('guest', reqs).then(passed => {
  console.log('Guest can do: ' + passed.join(', '))
  // Guest can do: post:read
})
```

Let's look deeper at the \[object Object\] returned in the user filter:

```js
lonamic.filter('user', reqs).then(passed => {
  console.log(passed[2])
  // { name: 'post:edit', rest: [ { db: [Function], userId: 1, postId: 1 } ] }
})
```

As you can see, Lonamic does not understand the underlying data structure. If it did, it would no longer be a generic tool that anyone can use, but an application specific one. If you would prefer that the filter function return, for example, the post directly, you will have to create your own filter function that knows your data structure.

But for now, we can convert the result:

```js
lonamic.filter('user', reqs).then(passed => {
  passed.forEach(req => {
    if (typeof req === 'object' && req.name === 'post:edit') {
      const params = req.rest[0]
      params.db // this is a reference to the db we made earlier!
        .getPost(params.postId)
        .then(console.log) // { by: 1 }
    }
  })
})
```

### Filtering Lots of Requests

First, let's generate a lot of posts:

```js
let posts = {}
for (let id = 0; id <= 100; id++) {
  let by
  if (id % 2 === 0) {
    by = 1 // Jane
  } else {
    by = 2 // Bob
  }
  // not bothering with fake bodies
  posts[id] = { by, title: `Post no.: ${id}` }
}
```

Next we will load the posts into our database and use Lonamic to filter out only the posts that belong to Jane \(Hint: all posts with an even id!\)

```js
db(posts)()
.then(db => {
  let reqs = []
  for (let id = 0; id <= 100; id++) {
    reqs = reqs.concat([{
      name: 'post:edit',
      rest: [{
        db,
        userId: 1, // Jane
        postId: id
      }]
    }])
  }
  lonamic.filter(users[0].role, reqs)
    .then(reqs => Promise.all(
      reqs.map(req => {
        // convert req into post (getPost returns a promise!)
        const params = req.rest[0]
        return params.db.getPost(params.postId)
      })
    ))
    .then(console.log) // Jane's posts
})
```

That's it! If you would like to know more, please read through the API documents, or look through the test folder in github! Happy programming.
