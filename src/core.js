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
        const role = lonamic.hydrateOf(rbacl, id)
        return handler({ role, id }, ...rest)
      },

      async filter (id = null, reqs = [], then, keys = {
        name: 'name',
        rest: 'rest'
      }) {
        const currentACL = lonamic.of(rbacl)

        if (typeof then === 'object') {
          keys = then
          then = undefined
        }

        async function filterRequests () {
          let result = []
          for (let i = 0; i < reqs.length; i++) {
            let req = reqs[i]
            let args = typeof req === 'string'
              ? [req]
              : [req[keys.name], ...req[keys.rest]]
            let check = await currentACL.can(id, ...args)
            if (check) {
              result = result.concat([req])
            }
          }
          return result
        }

        const result = await filterRequests()
        return then ? then(result) : result
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

  // sugar
  lonamic.hydrateOf = (rbacl, id) => lonamic(
    undefined, undefined, {
      rbacl: cloneDeep(rbacl)
    }
  ).hydrate(id).res

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
