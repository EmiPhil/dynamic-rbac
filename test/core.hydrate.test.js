import test from 'ava'
import { acl, lonamic } from '../src/core'
import { inheritance } from '../src/inheritance'

test('rbac(role).hydrate(x)', t => {
  const msg = 'should return the hydrated role'
  const roles = {
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const actual = lonamic(roles).hydrate('admin').res
  const expected = {
    incl: ['admin', 'manager'],
    can: [1, 2, 3, 4, 5, 6]
  }

  t.deepEqual(actual, expected, msg)
})

test('rbac(role).hydrator', t => {
  const msg = 'should return the hydrator used to hydrate'
  const roles = {
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const actual = lonamic(roles).hydrator.toString()
  const expected = inheritance()(lonamic(roles)).toString()

  t.deepEqual(actual, expected, msg)
})

test('acl({ hydrator: x })(role).hydrate(x)', t => {
  const msg = 'should support custom hydrators (1)'
  const roles = {
    admin: {
      can: [1, 2, 3],
      extends: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const hydrator = inheritance({
    keyword: 'extends'
  })

  const actual = acl({
    hydrator
  })(roles).hydrate('admin').res
  const expected = {
    incl: ['admin', 'manager'],
    can: [1, 2, 3, 4, 5, 6]
  }

  t.deepEqual(actual, expected, msg)
})

test('acl({ hydrator: x })(role).hydrate(x)', t => {
  const msg = 'should support custom hydrators (2)'
  const roles = {
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const hydrator = (rbacl, target) => {
    return {
      [target]: rbacl[target]
    }
  }

  const actual = acl({
    hydrator
  })(roles).hydrate('admin')
  const expected = {
    admin: roles['admin']
  }

  t.deepEqual(actual, expected, msg)
})
