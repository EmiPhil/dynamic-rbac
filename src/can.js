import _ from 'lodash'

export const assignPerm = (acc, perm) => {
  // assign each perm to the an object depending on type
  // if the perm is a func, we expect to receive a name and
  // a .when method to handle checks
  if (_.isString(perm)) {
    return _.assign(acc, { [perm]: 1 })
  } else if (_.isObject(perm)) {
    return _.assign(acc, { [perm.name]: perm.when })
  } else {
    return {}
  }
}

export const assignPerms = perms =>
  _.reduce(perms, assignPerm, {})

export function can ({
  role = {},
  roleId = ''
} = {}, req = '', params = {}, next) {
  // assigns an empty array if role.can is undefined
  role = _.assign({ can: [] }, role)
  // support 3 arguments if no params
  if (typeof params === 'function') {
    next = params
    params = {}
  }

  // assign perms to the canDo object
  const canDo = assignPerms(role.can)

  // always return a promise
  // this will create a performance hit for async apps,
  // but prevents hard to find errors in case of sync
  return new Promise(async (resolve, reject) => {
    // support cb
    function done (err, ...args) {
      return err
        ? next ? next(err) : reject(err)
        : next ? next(null, ...args) : resolve(...args)
    }

    // check that the req is even in the canDo obj
    if (canDo[req]) {
      // if the req was not a function, we can quickly return
      if (canDo[req] === 1) {
        return done(null, true)
      } else if (typeof canDo[req] === 'function') {
        // if the req is a function, try to call the .when method
        try {
          // pass Promise params into the .when for sync resolution
          const result = await new Promise((resolve, reject) =>
            canDo[req]({
              // give reference params + user defined params
              params: _.assign({ roleId, canDo }, params)
            }, function (err, res) { // simple cb to promise
              if (err) return reject(err)
              return resolve(res)
            })
          )
          // if there was no error, return the resolved value
          return done(null, result)
        } catch (err) {
          // user function hit reject, pass the err back
          return done(err)
        }
      } else {
        // .when is not a function
        return done('invalid input: .when is not a func')
      }
    } else {
      // canDo[req] does not exist, so access denied
      return done(null, false)
    }
  })
}

export default can
