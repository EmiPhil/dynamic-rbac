const assign = require('lodash/assign')

function filter ({
  role = {},
  roleId = ''
} = {}, req = '', params = {}, next) {
  let canDo = {}
  let result = false

  if (typeof params === 'function') {
    next = params
    params = {}
  }

  const handler = {
    'string': function (perm) {
      canDo[perm] = 1
    },
    'object': function (perm) {
      canDo[perm.name] = perm.when
    }
  }

  role.can.forEach(perm => handler[typeof perm](perm))

  if (canDo[req]) {
    if (canDo[req] === 1) {
      result = true
    } else if (typeof canDo[req] === 'function') {
      return canDo[req]({
        params: assign({
          roleId, canDo, next
        }, params)
      })
    }
  }

  return next ? next(result) : result
}

module.exports = filter
