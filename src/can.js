const assign = require('lodash/assign')

function can ({
  role = {},
  roleId = ''
} = {}, req, params) {
  let canDo = {}
  let result = false

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
      result = canDo[req]({
        params: assign({
          roleId, canDo
        }, params)
      })
    }
  }

  return result
}

module.exports = can
