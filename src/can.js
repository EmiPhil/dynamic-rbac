const assign = require('lodash/assign')

function can ({
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
      return new Promise(async resolve => {
        result = await canDo[req]({
          params: assign({
            roleId, canDo
          }, params)
        })
        if (next) {
          next(result)
          return
        }
        resolve(result)
      })
    }
  }

  if (next) {
    next(result)
    return
  }
  return result
}

module.exports = can
