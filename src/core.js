'use strict'

const assign = require('lodash/assign')
const cloneDeep = require('lodash/cloneDeep')
const defaults = require('lodash/defaults')

const {
  inheritance
} = require('./inheritance')

const can = require('./can')

// allow users to pass in options
function acl ({
  hydrator = inheritance(),
  handler = can
} = {}) {
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

      can (id = null, ...rest) {
        const role = lonamic.of(rbacl).hydrate(id).res
        return handler({ role, id }, ...rest)
      },

      add,
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
