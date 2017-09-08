'use strict'

import {
  assign,
  cloneDeep,
  defaults
} from 'lodash'

import inheritance from './inheritance'
import can from './can'
import filter from './filter'

// allow users to pass in options
export function acl ({
  hydrator = inheritance,
  canHandler = can,
  filterHandler = filter
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
        return canHandler({ role, id }, ...rest)
      },

      filter (id = null, ...rest) {
        const currentACL = lonamic.of(rbacl)
        return filterHandler({ acl: currentACL, id }, ...rest)
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
export default lonamic
