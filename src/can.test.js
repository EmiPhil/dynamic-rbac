const test = require('tape')
// const assign = require('lodash/assign')

const can = require('./can')

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
      when ({ params }) {
        return params.userRole === '3'
      }
    }]
  },
  '4': {
    can: [{
      name: 'd',
      when ({ params }) {
        return params.roleId === '4'
      }
    }]
  },
  '5': {
    can: [{
      name: 'e',
      when ({ params }) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(params.userRole === '5')
          }, 500)
        })
      }
    }]
  }
}

test('can(x)', assert => {
  const msg = 'predicate should return true'

  const actual = can({
    role: roles[1],
    roleId: '1'
  }, 'a')
  const expected = true

  assert.same(actual, expected, msg)
  assert.end()
})
/*
test('can(x)', assert => {
  const msg = 'predicate should return false'

  const actual = can({
    role: roles[1],
    roleId: '1'
  }, 'b')
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})

test('can(x) when', assert => {
  const msg = 'predicate should return false'

  const actual = can({
    role: roles[3],
    roleId: '3'
  }, 'c')
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})

test('can(x) when', assert => {
  const msg = 'predicate should return true'

  const actual = can({
    role: roles[3],
    roleId: '3'
  }, 'c', {
    userRole: '3'
  })
  console.log(actual)
  const expected = true

  assert.same(actual, expected, msg)
  assert.end()
})

test('can(x) when', assert => {
  const msg = 'predicate should return false'

  const actual = can({
    role: roles[4],
    roleId: '3'
  }, 'd')
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})

test('can(x) when', assert => {
  const msg = 'predicate should return true'

  const actual = can({
    role: roles[4],
    roleId: '4'
  }, 'd')
  const expected = true

  assert.same(actual, expected, msg)
  assert.end()
})

test('can(x) when param cb', assert => {
  const msg = 'predicate should return false'

  can({
    role: roles[5],
    roleId: '5'
  }, 'e', {
    userRole: '4',
    next (res) {
      const actual = res
      const expected = false

      assert.same(actual, expected, msg)
      assert.end()
    }
  })
})

test('can(x) when param cb', assert => {
  const msg = 'predicate should return true'

  can({
    role: roles[5],
    roleId: '5'
  }, 'e', {
    userRole: '5',
    next (res) {
      const actual = res
      const expected = true

      assert.same(actual, expected, msg)
      assert.end()
    }
  })
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return false'

  can({
    role: roles[5],
    roleId: '5'
  }, 'e', {
    userRole: '4'
  }, (res) => {
    const actual = res
    const expected = false

    assert.same(actual, expected, msg)
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
  }, (res) => {
    const actual = res
    const expected = true

    assert.same(actual, expected, msg)
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
  }, (res) => {
    const actual = res
    const expected = false

    assert.same(actual, expected, msg)
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
  }, (res) => {
    const actual = res
    const expected = true

    assert.same(actual, expected, msg)
    assert.end()
  })
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return false'

  can({
    role: roles[1],
    roleId: '1'
  }, 'a', (res) => {
    const actual = res
    const expected = true

    assert.same(actual, expected, msg)
    assert.end()
  })
})

test('can(x) when cb', assert => {
  const msg = 'predicate should return true'

  can({
    role: roles[1],
    roleId: '1'
  }, 'b', (res) => {
    const actual = res
    const expected = false

    assert.same(actual, expected, msg)
    assert.end()
  })
})
*/
