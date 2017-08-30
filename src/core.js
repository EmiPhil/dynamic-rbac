'use strict'

const assign = require('lodash/assign')
const cloneDeep = require('lodash/cloneDeep')
const defaults = require('lodash/defaults')

const {
  inheritance
} = require('./inheritance')

// allow users to pass in options
const acl = ({ hydrator = inheritance() } = {}) => {
  function lonamic (roles = {}, defs = {}, {
    rbacl = defaults(
      // clone deep to avoid tampering source objects
      cloneDeep(defs),
      cloneDeep(roles)
    )
  } = {}) {
    const add = newRoles => lonamic(
      assign({}, roles, newRoles), defs
    )

    const can = (roleId = null, req = null, params = {}) => {
      const role = lonamic.of(rbacl).hydrate(roleId).res
      let canDo = {}
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
          return true
        } else if (typeof canDo[req] === 'function') {
          return canDo[req]({
            params: assign({
              roleId, canDo
            }, params)
          })
        }
      }

      return false
    }

    // assign methods to lonamic
    return assign(add, {
      valueOf () {
        return rbacl
      },

      get roles () {
        return rbacl
      },

      get defaults () {
        return defs
      },

      role (x) {
        return rbacl[x]
      },

      get hydrator () {
        return hydrator(rbacl)
      },

      hydrate (roleId) {
        return hydrator(rbacl, roleId)
      },

      add,
      can,
      constructor: lonamic
    })
  }

  lonamic.of = rbacl => lonamic(
    undefined, undefined, {
      rbacl: cloneDeep(rbacl)
    }
  )

  lonamic.default = (def = {}, rbacl = { roles: '', defaults: '' }) => lonamic(
    rbacl.roles,
    assign({}, rbacl.defaults, def)
  )

  return lonamic
}

const lonamic = acl()

module.exports = {
  acl, lonamic
}
