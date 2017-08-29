const test = require('tape')

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
    can: roles['Editor'].can.concat(roles['Journalist'].can)
  }

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.can(Journalist, edit:all)', assert => {
  const msg = 'predicate should return false'

  const user = users['00003']
  const actual = lonamic(roles).can(user.title, 'edit:all')
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})
