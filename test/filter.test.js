import test from 'ava'
import { lonamic } from '../src/core'
import { filter, filterRequests } from '../src/filter'

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
        setTimeout(() => {
          next(null, params.userRole === '1')
        }, 50)
      }
    }]
  },
  '4': {
    can: [{
      name: 'd',
      when ({ params }, next) {
        setTimeout(() => {
          next(null, params.userRole === '1')
        }, 200)
      }
    }],
    inherits: ['1', '2', '3']
  },
  '5': {
    can: [{
      name: 'e',
      when ({ params }, next) {
        setTimeout(() => {
          next(params.err)
        }, 200)
      }
    }]
  }
}

const acl = lonamic(roles)

test('filter()', async t => {
  const msg = 'should return empty array'
  const actual = await filter()
  const expected = []
  t.deepEqual(actual, expected, msg)
})

test('filter(x)', async t => {
  const msg = 'should filter array'
  const params = { id: '1', acl }
  const reqs = ['a', 'b']
  const expected = ['a']
  const actual = await filter(params, reqs)
  t.deepEqual(actual, expected, 'async: ' + msg)
})

test('promise filter(x)', t => {
  const msg = 'should filter array'
  const params = { id: '1', acl }
  const reqs = ['a', 'b']
  const expected = ['a']
  return filter(params, reqs).then(res => {
    t.deepEqual(res, expected, 'promise: ' + msg)
  })
})

test.cb('cb filter(x)', t => {
  const msg = 'should filter array'
  const params = { id: '1', acl }
  const reqs = ['a', 'b']
  const expected = ['a']
  filter(params, reqs, (err, res) => {
    if (err) res = err
    t.deepEqual(res, expected, 'cb: ' + msg)
    t.end()
  })
})

test('filter(x) with sync can', async t => {
  const msg = 'should filter array'
  const params = { id: '3', acl }
  const reqs = ['a', 'b', {
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }]
  const expected = [{
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }]
  const actual = await filter(params, reqs)
  t.deepEqual(actual, expected, 'async: ' + msg)
})

test('promise filter(x) with sync can', t => {
  const msg = 'should filter array'
  const params = { id: '3', acl }
  const reqs = ['a', 'b', {
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }]
  const expected = [{
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }]
  return filter(params, reqs).then(res => {
    t.deepEqual(res, expected, 'promise: ' + msg)
  })
})

test.cb('cb filter(x) with sync can', t => {
  const msg = 'should filter array'
  const params = { id: '3', acl }
  const reqs = ['a', 'b', {
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }]
  const expected = [{
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }]
  filter(params, reqs, (err, res) => {
    if (err) res = err
    t.deepEqual(res, expected, 'cb: ' + msg)
    t.end()
  })
})

test('filter(x) with sync can', async t => {
  const msg = 'should filter array with inheritance'
  const params = { id: '4', acl }
  const reqs = ['a', 'b', {
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }, {
    name: 'd',
    rest: [{
      userRole: '1'
    }]
  }]
  const expected = reqs
  const actual = await filter(params, reqs)
  t.deepEqual(actual, expected, 'async: ' + msg)
})

test('promise filter(x) with sync can', t => {
  const msg = 'should filter array with inheritance'
  const params = { id: '4', acl }
  const reqs = ['a', 'b', {
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }, {
    name: 'd',
    rest: [{
      userRole: '1'
    }]
  }]
  const expected = reqs
  return filter(params, reqs).then(res => {
    t.deepEqual(res, expected, 'promise: ' + msg)
  })
})

test.cb('cb filter(x) with sync can', t => {
  const msg = 'should filter array with inheritance'
  const params = { id: '4', acl }
  const reqs = ['a', 'b', {
    name: 'c',
    rest: [{
      userRole: '1'
    }]
  }, {
    name: 'd',
    rest: [{
      userRole: '1'
    }]
  }]
  const expected = reqs
  filter(params, reqs, (err, res) => {
    if (err) res = err
    t.deepEqual(res, expected, 'cb: ' + msg)
    t.end()
  })
})

test('filter(x) with sync can and own keys', async t => {
  const msg = 'should filter array'
  const params = { id: '3', acl }
  const reqs = ['a', 'b', {
    target: 'c',
    args: [{
      userRole: '1'
    }]
  }]
  const keys = {
    name: 'target',
    rest: 'args'
  }
  const expected = [{
    target: 'c',
    args: [{
      userRole: '1'
    }]
  }]
  const actual = await filter(params, reqs, keys)
  t.deepEqual(actual, expected, 'async: ' + msg)
})

test('promise filter(x) with sync can and own keys', t => {
  const msg = 'should filter array'
  const params = { id: '3', acl }
  const reqs = ['a', 'b', {
    target: 'c',
    args: [{
      userRole: '1'
    }]
  }]
  const keys = {
    name: 'target',
    rest: 'args'
  }
  const expected = [{
    target: 'c',
    args: [{
      userRole: '1'
    }]
  }]
  return filter(params, reqs, keys).then(res => {
    t.deepEqual(res, expected, 'promise: ' + msg)
  })
})

test.cb('cb filter(x) with sync can and own keys', t => {
  const msg = 'should filter array'
  const params = { id: '3', acl }
  const reqs = ['a', 'b', {
    target: 'c',
    args: [{
      userRole: '1'
    }]
  }]
  const keys = {
    name: 'target',
    rest: 'args'
  }
  const expected = [{
    target: 'c',
    args: [{
      userRole: '1'
    }]
  }]
  filter(params, reqs, (err, res) => {
    if (err) res = err
    t.deepEqual(res, expected, 'cb: ' + msg)
    t.end()
  }, keys)
})

test('filter(x) returns errs', async t => {
  const msg = 'should filter array'
  const params = { id: '5', acl }
  const reqs = [{
    name: 'e',
    rest: [{
      err: 'Failed!'
    }]
  }]
  const expected = 'Failed!'
  try {
    await filter(params, reqs)
  } catch (err) {
    t.deepEqual(err, expected, 'async: ' + msg)
  }
})

test('promise filter(x) returns errs', t => {
  const msg = 'should filter array'
  const params = { id: '5', acl }
  const reqs = [{
    name: 'e',
    rest: [{
      err: 'Failed!'
    }]
  }]
  const expected = 'Failed!'
  return filter(params, reqs).catch(err => {
    t.deepEqual(err, expected, 'promise: ' + msg)
  })
})

test.cb('cb filter(x) returns errs', t => {
  const msg = 'should filter array'
  const params = { id: '5', acl }
  const reqs = [{
    name: 'e',
    rest: [{
      err: 'Failed!'
    }]
  }]
  const expected = 'Failed!'

  filter(params, reqs, (err, res) => {
    if (err) res = err
    t.deepEqual(res, expected, 'cb: ' + msg)
    t.end()
  })
})

// filterRequests is tested by filter, but we
// can do some basic tests here as well

test('filterRequests()', async t => {
  const msg = 'should return empty array'
  const actual = await filterRequests()
  const expected = []
  t.deepEqual(actual, expected, msg)
})

test('filterRequests(...args)', async t => {
  const msg = 'should return filtered reqs'
  const actual = await filterRequests({
    id: '1',
    reqs: ['a'],
    keys: {},
    acl
  })
  const expected = ['a']
  t.deepEqual(actual, expected, msg)
})

test('filterRequests(...args)', async t => {
  const msg = 'should return filtered reqs'
  const actual = await filterRequests({
    id: '1',
    reqs: ['b'],
    keys: {},
    acl
  })
  const expected = []
  t.deepEqual(actual, expected, msg)
})
