const test = require('tape')
const assign = require('lodash/assign')

const {
  lonamic
} = require('./core')

test('rbac(role)', assert => {
  const msg = 'should return .valueOf() with the new role'
  const role = {
    admin: {
      can: [1, 2, 3]
    }
  }

  const actual = lonamic(role).valueOf()
  const expected = role

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac(x)(y)', assert => {
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
  const expected = assign({}, ...roles)

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac(x)(x)', assert => {
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
  const expected = assign({}, ...roles)

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac(x).roles', assert => {
  const msg = 'should return roles'
  const role = {
    admin: {
      can: [1, 2, 3]
    }
  }

  const actual = lonamic(role).roles
  const expected = role

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac.default(x)(x)', assert => {
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

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac.default(x).defaults', assert => {
  const msg = 'should return default roles'
  const role = {
    admin: {
      can: [1, 2, 3]
    }
  }

  const actual = lonamic.default(role).defaults
  const expected = role

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac.default(x)(y).defaults', assert => {
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

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac.default(x)(y).roles', assert => {
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
  const expected = assign({}, ...roles)

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac(x).add(y)', assert => {
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

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac(x)(0)(false)(null)(undefined)', assert => {
  const msg = 'should ignore adding falsy values'
  const role = {
    admin: { can: [1, 2, 3] }
  }

  const actual = lonamic(role)(0)(false)(null)(undefined).roles
  const expected = role

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac(x)(1)(true)("")', assert => {
  const msg = 'should ignore adding invalid input values'
  const role = {
    admin: { can: [1, 2, 3] }
  }

  const actual = lonamic(role)(1)(true)('').roles
  const expected = role

  assert.same(actual, expected, msg)
  assert.end()
})

test('rbac(x).role(x.x)', assert => {
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

  assert.same(actual, expected, msg)
  assert.end()
})
