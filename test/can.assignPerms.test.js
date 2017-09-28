import test from 'ava'
import { assignPerm, assignPerms } from '../src/can'

const perms = [
  'post:read',
  {
    name: 'post:edit',
    when () { }
  }
]

test('assignPerms(perms)', t => {
  const msg = 'should assign perm array to object'

  const actual = assignPerms(perms)
  const expected = {
    'post:read': 1,
    'post:edit': perms[1].when
  }

  t.deepEqual(actual, expected, msg)
})

test('assignPerms(1)', t => {
  const msg = 'should return {}'

  const actual = assignPerms(1)
  const expected = {}

  t.deepEqual(actual, expected, msg)
})

test('assignPerm(string)', t => {
  const msg = 'should assign perm string to an object'

  const actual = assignPerm({}, perms[0])
  const expected = { 'post:read': 1 }
  t.deepEqual(actual, expected, msg)
})

test('assignPerm(object)', t => {
  const msg = 'should assign perm object to an object'

  const actual = assignPerm({}, perms[1])
  const expected = { 'post:edit': perms[1].when }
  t.deepEqual(actual, expected, msg)
})

test('assignPerm(1)', t => {
  const msg = 'should return empty object'

  const actual = assignPerm(1)
  const expected = {}
  t.deepEqual(actual, expected, msg)
})
