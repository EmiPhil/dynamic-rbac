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

test('lonamic(simpleRoles).filter()', async t => {
  const msg = 'should return empty array'
  const actual = await lonamic(simpleRoles).filter()
  const expected = []

  t.deepEqual(actual, expected, msg)
})

test('async lonamic(simpleRoles).filter(id, reqs)', async t => {
  const msg = 'should return all reqs'
  const reqs = ['delete', 'write']

  const actual = await lonamic(simpleRoles).filter('2', reqs)
  const expected = reqs

  t.deepEqual(actual, expected, msg)
})

test('promise lonamic(simpleRoles).filter(id, reqs)', t => {
  const msg = 'should return all reqs (promise)'
  const reqs = ['delete', 'write']

  return lonamic(simpleRoles).filter('2', reqs).then(res => {
    const actual = res
    const expected = reqs
    t.deepEqual(actual, expected, msg)
  })
})

test.cb('cb lonamic(simpleRoles).filter(id, reqs)', t => {
  const msg = 'should return all reqs (cb)'
  const reqs = ['delete', 'write']

  lonamic(simpleRoles).filter('2', reqs, (err, res) => {
    if (err) res = err
    const expected = reqs
    t.deepEqual(res, expected, msg)
    t.end()
  })
})

test('async lonamic(simpleRoles).filter(id, reqs)', async t => {
  const msg = 'should only return write'
  const reqs = ['delete', 'write']

  const actual = await lonamic(simpleRoles).filter('1', reqs)
  const expected = ['write']

  t.deepEqual(actual, expected, msg)
})

test('lonamic(simpleRoles).filter(id, reqs)', async t => {
  const msg = 'should only return write and delete'
  const reqs = ['delete', 'write', 'publish']

  const actual = await lonamic(simpleRoles).filter('2', reqs)
  const expected = ['delete', 'write']

  t.deepEqual(actual, expected, msg)
})

test('lonamic(simpleRoles).filter(id, reqs)', async t => {
  const msg = 'should return all reqs'
  const reqs = ['delete', 'write', 'publish']

  const actual = await lonamic(simpleRoles).filter('3', reqs)
  const expected = ['delete', 'write', 'publish']

  t.deepEqual(actual, expected, msg)
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

test('lonamic(advancedRoles).filter(id, reqs, { params }, next)', async t => {
  const msg = 'should return edit and write'
  const reqs = [{
    name: 'edit',
    rest: [
      {
        by: posts['1'].by,
        uId: 'abc'
      }
    ]
  }, 'write']

  const actual = await lonamic(advancedRoles).filter('2', reqs)
  const expected = reqs
  t.deepEqual(actual, expected, msg)
})

test('lonamic(advancedRoles).filter(id, reqs, { params }, next)', async t => {
  const msg = 'should return write'
  const reqs = [{
    name: 'edit',
    rest: [
      {
        by: posts['2'].by,
        uId: 'abc'
      }
    ]
  }, 'write']

  const actual = await lonamic(advancedRoles).filter('2', reqs)
  const expected = ['write']
  t.deepEqual(actual, expected, msg)
})
