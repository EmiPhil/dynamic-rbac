const test = require('tape')
const _ = require('lodash')

const uniqBy = arr => _.uniqBy(arr, item => item.name || item)

const {
  lonamic
} = require('../../core')
const { posts, users, roles } = require('./data')

test('test data should load', assert => {
  assert.same(
    Object.keys(posts).length, 100,
    'should be 100 posts'
  )
  assert.same(
    Object.keys(users).length, 6,
    'should be 6 users'
  )
  assert.same(
    Object.keys(roles).length, 3,
    'should be 3 posts'
  )
  assert.end()
})

test('lonamic(roles)', assert => {
  const msg = 'roles should load into lonamic'

  const actual = lonamic(roles).roles
  const expected = roles

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.hydrate(user.role)', assert => {
  const msg = 'lonamic should hydrate role'

  const user = users['00002']
  const actual = lonamic(roles).hydrate(user.title).res
  const expected = {
    incl: ['Editor', 'Journalist'],
    can: uniqBy(roles['Editor'].can.concat(roles['Journalist'].can))
  }

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.can(Journalist, edit:all)', assert => {
  const msg = 'predicate should return true only for own posts'

  const user = users['00003']
  const actual = _.compact(
    _.range(100).map(id => lonamic(roles).can(user.title, 'post:edit', {
      userId: '00003',
      postId: id
    }).then(bool => {
      console.log(bool)
    }))
  ).length
  const expected = 100 / 4

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.can(Editor, edit:all)', assert => {
  const msg = 'predicate should return true for all posts'

  const user = users['00002']
  const actual = _.compact(
    _.range(100).map(id => lonamic(roles).can(user.title, 'post:edit', {
      postId: id
    }))
  ).length
  const expected = 100

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.can(Journalist, edit:own)', assert => {
  const msg = 'predicate should return true'

  const user = users['00004']
  const actual = lonamic(roles).can(user.title, 'post:edit', {
    userId: '00004',
    postId: 0
  })
  const expected = true

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.can(Journalist, edit:own)', assert => {
  const msg = 'predicate should return false'

  const user = users['00004']
  const actual = lonamic(roles).can(user.title, 'post:edit', {
    userId: '00004',
    postId: 1
  })
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})
