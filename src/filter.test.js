const test = require('tape')

const {
  lonamic
} = require('./core')

const {
  filter,
  filterRequests
} = require('./filter')

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
        console.log('!!!', params)
        setTimeout(() => {
          next(params.err)
        }, 200)
      }
    }]
  }
}

const acl = lonamic(roles)

test('filter()', assert => {
  const msg = 'should return empty array'
  const actual = filter()
  const expected = []
  assert.same(actual, expected, msg)
  assert.end()
})

test('filter(x)', async assert => {
  const msg = 'should filter array'
  const params = { id: '1', acl }
  const reqs = ['a', 'b']
  const expected = ['a']

  filter(params, reqs, (err, res) => {
    if (err) res = err
    assert.same(res, expected, 'cb: ' + msg)
  })
  filter(params, reqs).then(res => {
    assert.same(res, expected, 'promise: ' + msg)
  })
  const actual = await filter(params, reqs)
  assert.same(actual, expected, 'async: ' + msg)

  assert.end()
})

test('filter(x) with sync can', async assert => {
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
    assert.same(res, expected, 'cb: ' + msg)
  })
  filter(params, reqs).then(res => {
    assert.same(res, expected, 'promise: ' + msg)
  })
  const actual = await filter(params, reqs)
  assert.same(actual, expected, 'async: ' + msg)

  assert.end()
})

test('filter(x) with sync can', async assert => {
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
    assert.same(res, expected, 'cb: ' + msg)
  })
  filter(params, reqs).then(res => {
    assert.same(res, expected, 'promise: ' + msg)
  })
  const actual = await filter(params, reqs)
  assert.same(actual, expected, 'async: ' + msg)

  assert.end()
})

test('filter(x) with sync can and own keys', async assert => {
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
    assert.same(res, expected, 'cb: ' + msg)
  }, keys)
  filter(params, reqs, keys).then(res => {
    assert.same(res, expected, 'promise: ' + msg)
  })
  const actual = await filter(params, reqs, keys)
  assert.same(actual, expected, 'async: ' + msg)

  assert.end()
})

test('filter(x) returns errs', async assert => {
  const msg = 'should filter array'
  const params = { id: '5', acl }
  const reqs = [{
    target: 'e',
    args: [{
      err: 'Failed!'
    }]
  }]
  const expected = 'Failed!'
  /*
  filter(params, reqs, (err, res) => {
    console.log('...', err, res)
    if (err) res = err
    assert.same(res, expected, 'cb: ' + msg)
  }) */
  filter(params, reqs).catch(res => {
    assert.same(res, expected, 'promise: ' + msg)
  })
  const actual = await filter(params, reqs)
  assert.same(actual, expected, 'async: ' + msg)

  assert.end()
})

// filterRequests is tested by filter, but we
// can do some basic tests here as well

test('filterRequests()', assert => {
  const msg = 'should return empty array'
  const actual = filterRequests()
  const expected = []
  assert.same(actual, expected, msg)
  assert.end()
})

test('filterRequests(...args)', async assert => {
  const msg = 'should return filtered reqs'
  const actual = await filterRequests({
    id: '1',
    reqs: ['a'],
    keys: {},
    acl
  })
  const expected = ['a']
  assert.same(actual, expected, msg)
  assert.end()
})

test('filterRequests(...args)', async assert => {
  const msg = 'should return filtered reqs'
  const actual = await filterRequests({
    id: '1',
    reqs: ['b'],
    keys: {},
    acl
  })
  const expected = []
  assert.same(actual, expected, msg)
  assert.end()
})
