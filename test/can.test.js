import test from 'ava'
import { can } from '../src/can'

test('can()', async t => {
  const msg = 'should return false'
  const actual = await can()
  const expected = false
  t.deepEqual(actual, expected, msg)
})

const roles = {
  '1': {
    can: ['a']
  },
  '2': {
    can: ['b']
  },
  '3': {
    can: [{
      name: 'c',
      when ({ params }, next) {
        next(null, params.userRole === '3')
      }
    }]
  },
  '4': {
    can: [{
      name: 'd',
      when ({ params }, next) {
        next(null, params.roleId === '4')
      }
    }]
  },
  '5': {
    can: [{
      name: 'e',
      when ({ params }, next) {
        setTimeout(() => {
          next(null, params.userRole === '5')
        }, 100)
      }
    }]
  },
  '6': {
    can: [{
      name: 'f',
      when ({ params }, next) {
        setTimeout(() => {
          next(params.fail)
        }, 100)
      }
    }]
  }
}

test('can(x)', t => {
  const msg = 'promise: predicate should return true'
  return can({
    role: roles[1],
    roleId: '1'
  }, 'a').then(result => {
    const expected = true
    t.deepEqual(result, expected, msg)
  })
})

test.cb('can(x)', t => {
  const msg = 'cb: predicate should return false'
  can({
    role: roles[1],
    roleId: '1'
  }, 'b', (err, res) => {
    if (err) res = err
    const expected = false
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test('can(x)', async t => {
  const msg = 'async: predicate should return false'

  const actual = await can({
    role: roles[1],
    roleId: '1'
  }, 'b')
  const expected = false

  t.deepEqual(actual, expected, msg)
})

test('can(x) when', async t => {
  const msg = 'async pattern: predicate should return false'

  const actual = await can({
    role: roles[3],
    roleId: '3'
  }, 'c')
  const expected = false

  t.deepEqual(actual, expected, msg)
})

test.cb('can(x) when', t => {
  const msg = 'cb pattern: predicate should return true'
  can({
    role: roles[3],
    roleId: '3'
  }, 'c', {
    userRole: '3'
  }, (err, res) => {
    if (err) res = err
    const expected = true
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test('can(x) when', t => {
  const msg = 'promise pattern: predicate should return false'
  return can({
    role: roles[4],
    roleId: '3'
  }, 'd').then((result) => {
    const expected = false
    t.deepEqual(result, expected, msg)
  })
})

test('can(x) when', async t => {
  const msg = 'predicate should return true'

  const actual = await can({
    role: roles[4],
    roleId: '4'
  }, 'd')
  const expected = true

  t.deepEqual(actual, expected, msg)
})

test.cb('can(x) when cb', t => {
  const msg = 'predicate should return false'

  can({
    role: roles[5],
    roleId: '5'
  }, 'e', {
    userRole: '4'
  }, (err, res) => {
    if (err) res = err
    const expected = false
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test.cb('can(x) when cb', t => {
  const msg = 'predicate should return true'

  can({
    role: roles[5],
    roleId: '5'
  }, 'e', {
    userRole: '5'
  }, (err, res) => {
    if (err) res = err
    const expected = true
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test.cb('can(x) when cb', t => {
  const msg = 'predicate should return false'

  can({
    role: roles[3],
    roleId: '3'
  }, 'c', {
    userRole: '2'
  }, (err, res) => {
    if (err) res = err
    const expected = false
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test.cb('can(x) when cb', t => {
  const msg = 'predicate should return true'

  can({
    role: roles[3],
    roleId: '3'
  }, 'c', {
    userRole: '3'
  }, (err, res) => {
    if (err) res = err
    const expected = true
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test.cb('can(x) when cb', t => {
  const msg = 'predicate should return true'
  can({
    role: roles[1],
    roleId: '1'
  }, 'a', (err, res) => {
    if (err) res = err
    const expected = true
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test.cb('can(x) when cb', t => {
  const msg = 'predicate should return false'
  can({
    role: roles[1],
    roleId: '1'
  }, 'b', (err, res) => {
    if (err) res = err
    const expected = false
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test('can(x) fail', async t => {
  const msg = 'receives failure message'
  const expected = 'Failed!'
  can({
    role: roles[6],
    roleId: '6'
  }, 'f', {
    fail: 'Failed!'
  }, (err) => {
    t.deepEqual(err, expected, 'cb: ' + msg)
  })

  can({
    role: roles[6],
    roleId: '6'
  }, 'f', {
    fail: 'Failed!'
  }).catch(err => {
    t.deepEqual(err, expected, 'promise: ' + msg)
  })
  try {
    await can({
      role: roles[6],
      roleId: '6'
    }, 'f', {
      fail: 'Failed!'
    })
  } catch (err) {
    t.deepEqual(err, expected, 'async: ' + msg)
  }
})

test('can(x) fail', async t => {
  const msg = 'receives failure message'
  const expected = 'invalid input: .when is not a func'
  const role = {
    can: [{
      name: '',
      when: 'invalid'
    }]
  }
  can({
    role
  }, (err) => {
    t.deepEqual(err, expected, 'cb: ' + msg)
  })

  can({
    role
  }).catch(err => {
    t.deepEqual(err, expected, 'promise: ' + msg)
  })
  try {
    await can({
      role
    })
  } catch (err) {
    t.deepEqual(err, expected, 'async: ' + msg)
  }
})
