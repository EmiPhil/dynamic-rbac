'use strict'

// we use a babel transform plugin to automatically cherry pick functions
// https://github.com/lodash/babel-plugin-lodash
import _ from 'lodash'

import inheritance from './inheritance'
import can from './can'
import filter from './filter'
import { encode, decode } from './encoder'

// allow users to pass in options
export function acl ({
  hydrator = inheritance,
  canHandler = can,
  filterHandler = filter,
  encoder = encode,
  decoder = decode
} = {}) {
  function lonamic (roles = {}, defs = {}, {
    rbacl = _.defaults(
      // clone deep to avoid tampering source objects
      _.cloneDeep(defs),
      _.cloneDeep(roles)
    )
  } = {}) {
    const add = newRoles => lonamic(
      _.assign({}, roles, newRoles), defs
    )

    // assign methods to lonamic
    return _.assign(add, {
      valueOf () {
        return rbacl
      },

      get roles () {
        return rbacl
      },

      get defaults () {
        return _.cloneDeep(defs)
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

      encode () {
        return encoder(roles, defs)
      },

      add,
      constructor: lonamic
    })
  }

  lonamic.of = rbacl => lonamic(
    undefined, undefined, {
      rbacl: _.cloneDeep(rbacl)
    }
  )

  // sugar
  lonamic.hydrateOf = (rbacl, id) => lonamic(
    undefined, undefined, {
      rbacl: _.cloneDeep(rbacl)
    }
  ).hydrate(id).res

  lonamic.default = (def = {}, rbacl = { roles: '', defaults: '' }) => lonamic(
    rbacl.roles,
    _.assign({}, rbacl.defaults, def)
  )

  lonamic.decode = (buffer) => lonamic.default(undefined, decoder(buffer))

  return lonamic
}

export const lonamic = acl()
