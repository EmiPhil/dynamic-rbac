const test = require('tape')

const {
  assignPerm,
  assignPerms
} = require('../src/can')

const perms = [
  'post:read',
  {
    name: 'post:edit',
    when () { }
  }
]

test('assignPerms(perms)', assert => {
  const msg = 'should assign perm array to object'

  const actual = assignPerms(perms)
  const expected = {
    'post:read': 1,
    'post:edit': perms[1].when
  }

  assert.same(actual, expected, msg)
  assert.end()
})

test('assignPerms(1)', assert => {
  const msg = 'should return {}'

  const actual = assignPerms(1)
  const expected = {}

  assert.same(actual, expected, msg)
  assert.end()
})

test('assignPerm(string)', assert => {
  const msg = 'should assign perm string to an object'

  const actual = assignPerm({}, perms[0])
  const expected = { 'post:read': 1 }
  assert.same(actual, expected, msg)
  assert.end()
})

test('assignPerm(object)', assert => {
  const msg = 'should assign perm object to an object'

  const actual = assignPerm({}, perms[1])
  const expected = { 'post:edit': perms[1].when }
  assert.same(actual, expected, msg)
  assert.end()
})

test('assignPerm(1)', assert => {
  const msg = 'should return empty object'

  const actual = assignPerm(1)
  const expected = {}
  assert.same(actual, expected, msg)
  assert.end()
})
