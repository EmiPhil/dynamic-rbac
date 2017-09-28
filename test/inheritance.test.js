const test = require('tape')

const {
  lonamic
} = require('../src/core')

const {
  hydrator
} = require('../src/inheritance')

test('hydrator()', assert => {
  const msg = 'should return an empty array'
  const actual = hydrator().valueOf()
  const expected = { incl: [] }
  assert.same(actual, expected, msg)
  assert.end()
})

test('hydrator(x)', assert => {
  const msg = 'should find all inheritance'
  const roles = [{
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    }
  }, {
    manager: {
      can: [4, 5, 6]
    }
  }]

  const rbac = lonamic(...roles).roles
  const actual = hydrator(rbac)('admin').valueOf()
  const expected = {
    incl: ['admin', 'manager'],
    can: [1, 2, 3, 4, 5, 6]
  }

  assert.same(actual, expected, msg)
  assert.end()
})

test('hydrator(x)', assert => {
  const msg = 'should merge circular inheritance'
  const roles = {
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6],
      inherits: ['admin']
    }
  }

  const rbac = lonamic(roles).roles
  const actual = hydrator(rbac)('admin').valueOf()
  const expected = {
    incl: ['admin', 'manager'],
    can: [1, 2, 3, 4, 5, 6]
  }

  assert.same(actual, expected, msg)
  assert.end()
})

test('hydrator(x)', assert => {
  const msg = 'should not duplicate inheritance'
  const roles = {
    superAdmin: {
      can: [0],
      inherits: ['admin', 'manager']
    },
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const rbac = lonamic(roles).roles
  const actual = hydrator(rbac)('superAdmin').valueOf()
  const expected = {
    incl: ['superAdmin', 'admin', 'manager'],
    can: [0, 1, 2, 3, 4, 5, 6]
  }

  assert.same(actual, expected, msg)
  assert.end()
})

test('hydrator(x).cycles', assert => {
  const msg = 'should not do redundant ops'
  const roles = {
    superAdmin: {
      can: [0],
      inherits: ['admin', 'admin2', 'manager']
    },
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    admin2: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const rbac = lonamic(roles).roles
  const actual = hydrator(rbac)('superAdmin').cycles
  const expected = 4

  assert.same(actual, expected, msg)
  assert.end()
})

test('hydrator(x).keyword', assert => {
  const msg = 'should return keyword used for inheritance searching'
  const roles = {
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const rbac = lonamic(roles).roles
  const actual = hydrator(rbac)('admin').keyword
  const expected = 'inherits'

  assert.same(actual, expected, msg)
  assert.end()
})

test('hydrator(x).res', assert => {
  const msg = 'should return result'
  const roles = {
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const rbac = lonamic(roles).roles
  const actual = hydrator(rbac)('admin').res
  const expected = {
    incl: ['admin', 'manager'],
    can: [1, 2, 3, 4, 5, 6]
  }

  assert.same(actual, expected, msg)
  assert.end()
})

test('hydrator(x).target', assert => {
  const msg = 'should keep a reference to the initial target'
  const roles = {
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const rbac = lonamic(roles).roles
  const actual = hydrator(rbac, 'admin').target
  const expected = 'admin'

  assert.same(actual, expected, msg)
  assert.end()
})

test('hydrator(x).toString()', assert => {
  const msg = 'should convert into a string'
  const roles = {
    admin: {
      can: [1, 2, 3],
      inherits: ['manager']
    },
    manager: {
      can: [4, 5, 6]
    }
  }

  const rbac = lonamic(roles).roles
  const actual = hydrator(rbac, 'admin').toString()
  const expected = `rbacl[admin] => {"incl":["admin","manager"],"can":[1,2,3,4,5,6]}`

  assert.same(actual, expected, msg)
  assert.end()
})
