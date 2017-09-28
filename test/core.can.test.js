import test from 'ava'
import { lonamic } from '../src/core'

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

test('lonamic(simpleRoles).can()', async t => {
  const msg = 'should return false'
  const actual = await simpleAcl.can()
  const expected = false

  t.deepEqual(actual, expected, msg)
})

test('lonamic(simpleRoles).can(id, req)', async t => {
  const msg = 'should return true'
  const req = 'write'
  const expected = true
  const actual = await simpleAcl.can('2', req)
  t.deepEqual(actual, expected, 'async: ' + msg)
})

test('promise lonamic(simpleRoles).can(id, req)', t => {
  const msg = 'should return true'
  const req = 'write'
  const expected = true
  return simpleAcl.can('2', req).then(res => {
    t.deepEqual(res, expected, 'promise: ' + msg)
  })
})

test.cb('cb lonamic(simpleRoles).can(id, req)', t => {
  const msg = 'should return true'
  const req = 'write'
  const expected = true
  simpleAcl.can('2', req, (err, res) => {
    if (err) res = err
    t.deepEqual(res, expected, 'cb: ' + msg)
    t.end()
  })
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

test('lonamic(advancedRoles).can(id, req, { params })', async t => {
  const msg = 'should return true'
  const req = 'edit'
  const params = {
    by: posts['1'].by,
    uId: 'abc'
  }
  const expected = true
  const actual = await advancedAcl.can('2', req, params)
  t.deepEqual(actual, expected, msg)
})

test('promise lonamic(advancedRoles).can(id, req, { params })', t => {
  const msg = 'should return true'
  const req = 'edit'
  const params = {
    by: posts['1'].by,
    uId: 'abc'
  }
  const expected = true
  return advancedAcl.can('2', req, params).then(res => {
    t.deepEqual(res, expected, 'promise: ' + msg)
  })
})

test.cb('cb lonamic(advancedRoles).can(id, req, { params })', t => {
  const msg = 'should return true'
  const req = 'edit'
  const params = {
    by: posts['1'].by,
    uId: 'abc'
  }
  const expected = true
  advancedAcl.can('2', req, params, (err, res) => {
    if (err) res = err
    t.deepEqual(res, expected, 'cb: ' + msg)
    t.end()
  })
})
