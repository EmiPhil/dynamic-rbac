import test from 'ava'
import _ from 'lodash'
import { lonamic } from '../src/core'

test('rbac(role)', t => {
  const msg = 'should return .valueOf() with the new role'
  const role = {
    admin: {
      can: [1, 2, 3]
    }
  }

  const actual = lonamic(role).valueOf()
  const expected = role

  t.deepEqual(actual, expected, msg)
})

test('rbac(x)(y)', t => {
  const msg = 'should allow adding multiple roles'
  const roles = [{
    admin: {
      can: [1, 2, 3]
    }
  }, {
    manager: {
      can: [1, 2, 3]
    }
  }]

  const actual = lonamic(roles[0])(roles[1]).valueOf()
  const expected = _.assign({}, ...roles)

  t.deepEqual(actual, expected, msg)
})

test('rbac(x)(x)', t => {
  const msg = 'should overwrite role of same id'
  const roles = [{
    admin: {
      can: [1, 2, 3]
    }
  }, {
    admin: {
      can: [4, 5, 6]
    }
  }]

  const actual = lonamic(roles[0])(roles[1]).valueOf()
  const expected = _.assign({}, ...roles)

  t.deepEqual(actual, expected, msg)
})

test('rbac(x).roles', t => {
  const msg = 'should return roles'
  const role = {
    admin: {
      can: [1, 2, 3]
    }
  }

  const actual = lonamic(role).roles
  const expected = role

  t.deepEqual(actual, expected, msg)
})

test('rbac.default()', t => {
  const msg = 'should return empty object'
  const actual = lonamic.default().valueOf()
  const expected = {}
  t.deepEqual(actual, expected, msg)
})

test('rbac.default(x)(x)', t => {
  const msg = 'should not overwrite default role of same id'
  const roles = [{
    admin: {
      can: [1, 2, 3]
    }
  }, {
    admin: {
      can: [4, 5, 6]
    }
  }]

  const actual = lonamic.default(roles[0])(roles[1]).valueOf()
  const expected = roles[0]

  t.deepEqual(actual, expected, msg)
})

test('rbac.default(x).defaults', t => {
  const msg = 'should return default roles'
  const role = {
    admin: {
      can: [1, 2, 3]
    }
  }

  const actual = lonamic.default(role).defaults
  const expected = role

  t.deepEqual(actual, expected, msg)
})

test('rbac.default(x)(y).defaults', t => {
  const msg = 'should only return default roles'
  const roles = [{
    admin: {
      can: [1, 2, 3]
    }
  }, {
    manager: {
      can: [4, 5, 6]
    }
  }]

  const actual = lonamic.default(roles[0])(roles[1]).defaults
  const expected = roles[0]

  t.deepEqual(actual, expected, msg)
})

test('rbac.default(x)(y).roles', t => {
  const msg = 'should return all roles'
  const roles = [{
    admin: {
      can: [1, 2, 3]
    }
  }, {
    manager: {
      can: [4, 5, 6]
    }
  }]

  const actual = lonamic.default(roles[0])(roles[1]).roles
  const expected = _.assign({}, ...roles)

  t.deepEqual(actual, expected, msg)
})

test('rbac(x).add(y)', t => {
  const msg = 'should be === to rbac(x)(y)'
  const roles = [{
    admin: {
      can: [1, 2, 3]
    }
  }, {
    manager: {
      can: [4, 5, 6]
    }
  }]

  const actual = lonamic(roles[0]).add(roles[1]).roles
  const expected = lonamic(roles[0])(roles[1]).roles

  t.deepEqual(actual, expected, msg)
})

test('rbac(x)(0)(false)(null)(undefined)', t => {
  const msg = 'should ignore adding falsy values'
  const role = {
    admin: { can: [1, 2, 3] }
  }

  const actual = lonamic(role)(0)(false)(null)(undefined).roles
  const expected = role

  t.deepEqual(actual, expected, msg)
})

test('rbac(x)(1)(true)("")', t => {
  const msg = 'should ignore adding invalid input values'
  const role = {
    admin: { can: [1, 2, 3] }
  }

  const actual = lonamic(role)(1)(true)('').roles
  const expected = role

  t.deepEqual(actual, expected, msg)
})

test('rbac(x).role(x.x)', t => {
  const msg = 'should retrieve role id x'
  const roles = {
    admin: {
      can: [1, 2, 3]
    },
    manager: {
      can: [4, 5, 6]
    }
  }
  const actual = lonamic(roles).role('admin')
  const expected = roles.admin

  t.deepEqual(actual, expected, msg)
})
