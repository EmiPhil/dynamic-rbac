# .filter

The .filter method is used on an array of actions to determine which actions a role has privileges on. This is useful if, for example, you have a list of posts and want to filter out the ones that the user can edit.

First, let's define a simple acl to show the functionality of `filter`:

```js
const Lonamic = require('lonamic').lonamic

const roles = {
  'author': {
    can: [
      'write',
    {
      name: 'edit',
      when ({ params }, next) {
        setTimeout(() => {
          next(null, params.by === params.uId)
        }, 150)
      }
    }]
  },
  'editor': {
    can: ['edit'],
    inherits: ['author']
  }
}

const lonamic = Lonamic(roles)

const posts = [
  { by: 'authorA', id: 1 },
  { by: 'authorB', id: 2 },
  { by: 'authorA', id: 3 },
  { by: 'authorB', id: 4 },
  { by: 'editorA', id: 5 }
]

const people = [
  { role: 'author', id: 'authorA' },
  { role: 'author', id: 'authorB' },
  { role: 'editor', id: 'editorA' }
]
```

The above acl defines roles for authors and editors. Authors should be able to write new posts, and edit their own posts. Editors should be able to write new posts, and edit all posts.

## Basic Usage

`lonamic.filter(roleId = '', actions = [{}], { params } = {}, cb = () => {})`

The filter function requires an action array of what you would typically pass into the can function. It can include strings for simple permissions, or objects with the following signature:

```js
{
  name: 'permissionName',
  rest: [params, cb]
}
```

Internally, this object is applied directly to a series of `can` calls, with the name being the action and the rest array being spread to the last arguments of the can function.

It is recommended to create some helper functions to convert your objects, which lonamic has no concept of, into and out of action arrays:

```js
const convertToActionArray = userId => post => ({
  name: 'edit',
  rest: [{ ...post, userId }]
})

const convertToPost = action => action.rest[0].id
```

The key to successful filters is exploiting the params object inside the rest array. Anything inside of the params object will get passed back to callee, so we can include the postId in the params object to get the post id in the convertToPost function, even though the when function has no use for it.

```js
people.forEach(async person => {
  const { role, id } = person
  const converter = convertToActionArray(id)

  const actions = posts.map(converter)
  const approvedActions = await lonamic.filter(role, actions)

  const editablePosts = approvedActions.map(convertToPost).join(', ')

  console.log(`${id} can edit posts ${editablePosts}`)
  // editorA can edit posts 1, 2, 3, 4, 5
  // authorA can edit posts 1, 3
  // authorB can edit posts 2, 4
})
```

For more examples using filter, check out some of the tests and examples in the [test folder](https://github.com/EmiPhil/lonamic/tree/master/test).
