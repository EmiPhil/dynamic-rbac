const test = require('tape')
// const assign = require('lodash/assign')

const {
  acl, lonamic
} = require('./core')

const {
  inheritance
} = require('./inheritance')

test('rbac(role).hydrate(x)', assert => {
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

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac(role).hydrator', assert => {
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

  assert.same(actual, expected, msg)
  assert.end()
})

test('acl({ hydrator: x })(role).hydrate(x)', assert => {
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

  assert.same(actual, expected, msg)
  assert.end()
})

test('acl({ hydrator: x })(role).hydrate(x)', assert => {
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

  assert.same(actual, expected, msg)
  assert.end()
})
