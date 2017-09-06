const test = require('tape')

const {
  lonamic
} = require('./core')

const simpleRoles = {
  '1': {
    can: ['write']
  },
  '2': {
    can: ['delete'],
    inherits: ['1']
  },
  '3': {
    can: ['publish'],
    inherits: ['1', '2']
  }
}

const simpleAcl = lonamic(simpleRoles)

test('lonamic(simpleRoles).can()', async assert => {
  const msg = 'should return false'
  const actual = await simpleAcl.can()
  const expected = false

  assert.same(actual, expected, msg)
  assert.end()
})

test('lonamic(simpleRoles).can(id, req)', async assert => {
  const msg = 'should return true'
  const req = 'write'
  const expected = true

  simpleAcl.can('2', req, (err, res) => {
    if (err) res = err
    assert.same(res, expected, 'cb: ' + msg)
  })

  simpleAcl.can('2', req).then(res => {
    assert.same(res, expected, 'promise: ' + msg)
  })

  const actual = await simpleAcl.can('2', req)
  assert.same(actual, expected, 'async: ' + msg)
  assert.end()
})

const advancedRoles = {
  '1': {
    can: [{
      name: 'edit',
      when ({ params }, next) {
        setTimeout(() => {
          next(null, params.by === params.uId)
        }, 150)
      }
    }]
  },
  '2': {
    can: ['write'],
    inherits: ['1']
  },
  '3': {
    can: ['publish', 'edit'],
    inherits: ['2']
  }
}

const posts = {
  '1': {
    by: 'abc'
  },
  '2': {
    by: 'def'
  }
}

const advancedAcl = lonamic(advancedRoles)

test('lonamic(advancedRoles).can(id, req, { params })', async assert => {
  const msg = 'should return true'
  const req = 'edit'
  const params = {
    by: posts['1'].by,
    uId: 'abc'
  }
  const expected = true

  advancedAcl.can('2', req, params, (err, res) => {
    if (err) res = err
    assert.same(res, expected, 'cb: ' + msg)
  })

  advancedAcl.can('2', req, params).then(res => {
    assert.same(res, expected, 'promise: ' + msg)
  })

  const actual = await advancedAcl.can('2', req, params)
  assert.same(actual, expected, msg)
  assert.end()
})
