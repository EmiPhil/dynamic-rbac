const test = require('tape')
// const assign = require('lodash/assign')

const {
  can
} = require('../src/can')

test('can()', assert => {
  const msg = 'should return false'
  can().then(result => {
    const expected = false
    assert.same(result, expected, msg)
    assert.end()
  })
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

test('can(x)', assert => {
  const msg = 'promise: predicate should return true'
  can({
    role: roles[1],
    roleId: '1'
  }, 'a').then(result => {
    const expected = true
    assert.same(result, expected, msg)
    assert.end()
  })
})

test('can(x)', assert => {
  const msg = 'cb: predicate should return false'
  can({
    role: roles[1],
    roleId: '1'
  }, 'b', (err, res) => {
    if (err) res = err
    const expected = false
    assert.same(res, expected, msg)
    assert.end()
  })
})

test('can(x)', async assert => {
  const msg = 'async: predicate should return false'

  const actual = await can({
    role: roles[1],
    roleId: '1'
  }, 'b')
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})

test('can(x) when', async assert => {
  const msg = 'async pattern: predicate should return false'

  const actual = await can({
    role: roles[3],
    roleId: '3'
  }, 'c')
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})

test('can(x) when', assert => {
  const msg = 'cb pattern: predicate should return true'
  can({
    role: roles[3],
    roleId: '3'
  }, 'c', {
    userRole: '3'
  }, (err, res) => {
    if (err) res = err
    const expected = true
    assert.same(res, expected, msg)
    assert.end()
  })
})

test('can(x) when', assert => {
  const msg = 'promise pattern: predicate should return false'
  can({
    role: roles[4],
    roleId: '3'
  }, 'd').then((result) => {
    const expected = false
    assert.same(result, expected, msg)
    assert.end()
  })
})

test('can(x) when', async assert => {
  const msg = 'predicate should return true'

  const actual = await can({
    role: roles[4],
    roleId: '4'
  }, 'd')
  const expected = true

  assert.same(actual, expected, msg)
  assert.end()
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return false'

  can({
    role: roles[5],
    roleId: '5'
  }, 'e', {
    userRole: '4'
  }, (err, res) => {
    if (err) res = err
    const expected = false
    assert.same(res, expected, msg)
    assert.end()
  })
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return true'

  can({
    role: roles[5],
    roleId: '5'
  }, 'e', {
    userRole: '5'
  }, (err, res) => {
    if (err) res = err
    const expected = true
    assert.same(res, expected, msg)
    assert.end()
  })
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return false'

  can({
    role: roles[3],
    roleId: '3'
  }, 'c', {
    userRole: '2'
  }, (err, res) => {
    if (err) res = err
    const expected = false
    assert.same(res, expected, msg)
    assert.end()
  })
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return true'

  can({
    role: roles[3],
    roleId: '3'
  }, 'c', {
    userRole: '3'
  }, (err, res) => {
    if (err) res = err
    const expected = true
    assert.same(res, expected, msg)
    assert.end()
  })
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return true'
  can({
    role: roles[1],
    roleId: '1'
  }, 'a', (err, res) => {
    if (err) res = err
    const expected = true
    assert.same(res, expected, msg)
    assert.end()
  })
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return false'
  can({
    role: roles[1],
    roleId: '1'
  }, 'b', (err, res) => {
    if (err) res = err
    const expected = false
    assert.same(res, expected, msg)
    assert.end()
  })
})

test('can(x) fail', async assert => {
  const msg = 'receives failure message'
  const expected = 'Failed!'
  can({
    role: roles[6],
    roleId: '6'
  }, 'f', {
    fail: 'Failed!'
  }, (err) => {
    assert.same(err, expected, 'cb: ' + msg)
  })

  can({
    role: roles[6],
    roleId: '6'
  }, 'f', {
    fail: 'Failed!'
  }).catch(err => {
    assert.same(err, expected, 'promise: ' + msg)
  })
  try {
    await can({
      role: roles[6],
      roleId: '6'
    }, 'f', {
      fail: 'Failed!'
    })
  } catch (err) {
    assert.same(err, expected, 'async: ' + msg)
  }
  assert.end()
})

test('can(x) fail', async assert => {
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
    assert.same(err, expected, 'cb: ' + msg)
  })

  can({
    role
  }).catch(err => {
    assert.same(err, expected, 'promise: ' + msg)
  })
  try {
    await can({
      role
    })
  } catch (err) {
    assert.same(err, expected, 'async: ' + msg)
  }
  assert.end()
})
