import test from 'ava'
import { lonamic } from '../src/core'
import { hydrator } from '../src/inheritance'

test('hydrator()', t => {
  const msg = 'should return an empty array'
  const actual = hydrator().valueOf()
  const expected = { incl: [] }
  t.deepEqual(actual, expected, msg)
})

test('hydrator(x)', t => {
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

  t.deepEqual(actual, expected, msg)
})

test('hydrator(x)', t => {
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

  t.deepEqual(actual, expected, msg)
})

test('hydrator(x)', t => {
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

  t.deepEqual(actual, expected, msg)
})

test('hydrator(x).cycles', t => {
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

  t.deepEqual(actual, expected, msg)
})

test('hydrator(x).keyword', t => {
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

  t.deepEqual(actual, expected, msg)
})

test('hydrator(x).res', t => {
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

  t.deepEqual(actual, expected, msg)
})

test('hydrator(x).target', t => {
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

  t.deepEqual(actual, expected, msg)
})

test('hydrator(x).toString()', t => {
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

  t.deepEqual(actual, expected, msg)
})
