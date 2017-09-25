const test = require('tape')
const _ = require('lodash')

const uniqBy = arr => _.uniqBy(arr, item => item.name || item)

const {
  lonamic
} = require('../../../src/core')
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

test('lonamic.can(Journalist, edit:all)', async assert => {
  const msg = 'predicate should return true only for own posts'
  const user = users['00003']
  const actual = _.compact(
    await Promise.all(_.range(100)
      .map(async id => lonamic(roles)
        .can(user.title, 'post:edit', {
          userId: '00003',
          postId: id
        })
      )
    )
  ).length
  const expected = 100 / 4

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.can(Editor, edit:all)', async assert => {
  const msg = 'predicate should return true for all posts'

  const user = users['00002']
  const actual = _.compact(
    await Promise.all(_.range(100)
      .map(async id => lonamic(roles)
        .can(user.title, 'post:edit', {
          postId: id
        })
      )
    )
  ).length
  const expected = 100

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.can(Journalist, edit:own)', async assert => {
  const msg = 'predicate should return true'

  const user = users['00004']
  const actual = await lonamic(roles).can(user.title, 'post:edit', {
    userId: '00003',
    postId: 0
  })
  const expected = true

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.can(Journalist, edit:own)', async assert => {
  const msg = 'predicate should return false'

  const user = users['00004']
  const actual = await lonamic(roles).can(user.title, 'post:edit', {
    userId: '00003',
    postId: 1
  })
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic.filter(Journalist, posts)', async assert => {
  const reqs = (userId) => _.range(100).map(id => ({
    name: 'post:edit',
    rest: [{
      userId,
      postId: id
    }]
  }))

  const acl = lonamic(roles)
  await Promise.all(
    _.range(3, 6).map(async uid => {
      const userId = '0000' + uid
      const user = users[userId]
      const canDo = await acl.filter(user.title, reqs(userId))
      const actual = canDo.map(req => req.rest[0].postId)
      const expected = _.range(uid - 3, 100, 4)

      assert.same(actual, expected, `should filter editable posts (1 in 4 chance) - ${user.name} : ${userId}`)
    })
  )
  assert.end()
})

test('lonamic.filter(Editor, posts)', async assert => {
  const msg = 'should filter editable posts (all)'
  const user = users['00002']
  const reqs = _.range(100).map(id => ({
    name: 'post:edit',
    rest: [{
      userId: '00002',
      postId: id
    }]
  }))

  const canDo = await lonamic(roles).filter(user.title, reqs)
  const actual = canDo.map(req => req.rest[0].postId)
  const expected = _.range(100)

  assert.same(actual, expected, msg)
  assert.end()
})
