import test from 'ava'
import _ from 'lodash'
import { lonamic } from '../../../src/core'
import { posts, users, roles } from './data'

const uniqBy = arr => _.uniqBy(arr, item => item.name || item)

test('test data should load', t => {
  t.plan(3)
  t.deepEqual(
    Object.keys(posts).length, 100,
    'should be 100 posts'
  )
  t.deepEqual(
    Object.keys(users).length, 6,
    'should be 6 users'
  )
  t.deepEqual(
    Object.keys(roles).length, 3,
    'should be 3 posts'
  )
})

test('lonamic(roles)', t => {
  const msg = 'roles should load into lonamic'

  const actual = lonamic(roles).roles
  const expected = roles

  t.deepEqual(actual, expected, msg)
})

test('lonamic.hydrate(user.role)', t => {
  const msg = 'lonamic should hydrate role'

  const user = users['00002']
  const actual = lonamic(roles).hydrate(user.title).res
  const expected = {
    incl: ['Editor', 'Journalist'],
    can: uniqBy(roles['Editor'].can.concat(roles['Journalist'].can))
  }

  t.deepEqual(actual, expected, msg)
})

test('lonamic.can(Journalist, edit:all)', async t => {
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

  t.deepEqual(actual, expected, msg)
})

test('lonamic.can(Editor, edit:all)', async t => {
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

  t.deepEqual(actual, expected, msg)
})

test('lonamic.can(Journalist, edit:own)', async t => {
  const msg = 'predicate should return true'

  const user = users['00004']
  const actual = await lonamic(roles).can(user.title, 'post:edit', {
    userId: '00003',
    postId: 0
  })
  const expected = true

  t.deepEqual(actual, expected, msg)
})

test('lonamic.can(Journalist, edit:own)', async t => {
  const msg = 'predicate should return false'

  const user = users['00004']
  const actual = await lonamic(roles).can(user.title, 'post:edit', {
    userId: '00003',
    postId: 1
  })
  const expected = false

  t.deepEqual(actual, expected, msg)
})

test('lonamic.filter(Journalist, posts)', async t => {
  const reqs = (userId) => _.range(100).map(id => ({
    name: 'post:edit',
    rest: [{
      userId,
      postId: id
    }]
  }))

  t.plan(4)

  const acl = lonamic(roles)
  await Promise.all(
    _.range(3, 7).map(async uid => {
      const userId = '0000' + uid
      const user = users[userId]
      const canDo = await acl.filter(user.title, reqs(userId))
      const actual = canDo.map(req => req.rest[0].postId)
      const expected = _.range(uid - 3, 100, 4)

      t.deepEqual(actual, expected, `should filter editable posts (1 in 4 chance) - ${user.name} : ${userId}`)
    })
  )
})

test('lonamic.filter(Editor, posts)', async t => {
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

  t.deepEqual(actual, expected, msg)
})
