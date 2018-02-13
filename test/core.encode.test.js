import test from 'ava'
import { lonamic } from '../src/core'
import { Buffer } from 'buffer/'

test('lonamic(roles).encode()', t => {
  const msg = 'should return an encoded buffer'
  const roleDefinition = {
    a: { can: [1] }
  }
  const acl = lonamic(roleDefinition)

  const { roles, defaults } = acl
  const obj = { roles, defaults }

  const actual = acl.encode()
  const expected = Buffer.from(JSON.stringify(obj))

  t.deepEqual(actual, expected, msg)
})

test('lonamic(roles).decode()', t => {
  const msg = 'should return a lonamic instance'
  const roles = {
    a: { can: [1] }
  }

  const actual = lonamic.decode(lonamic(roles).encode()).valueOf()
  const expected = lonamic(roles).valueOf()

  t.deepEqual(actual, expected, msg)
})

test('lonamic(defaults)', t => {
  const msg = 'encode and decode should preserve defaults'
  const defaults = {
    a: { can: [1] }
  }

  const actual = lonamic.decode(
    lonamic.default(defaults).encode()
  ).defaults

  t.deepEqual(actual, defaults, msg)
})
