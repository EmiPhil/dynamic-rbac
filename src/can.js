const assign = require('lodash/assign')

function can ({
  role = {},
  roleId = ''
} = {}, req = '', params = {}, next) {
  let canDo = {}
  // support 3 arguments if no params
  if (typeof params === 'function') {
    next = params
    params = {}
  }

  // assign perm to canDo based on typeof
  const handler = {
    'string': function (perm) {
      canDo[perm] = 1
    },
    'object': function (perm) {
      canDo[perm.name] = perm.when
    }
  }

  // assign each perm to the canDo object depending on type
  // if the perm is a func, we expect to receive a name and
  // a .when method to handle checks
  role.can.forEach(perm => handler[typeof perm](perm))

  // always return a promise
  // this will create a performance hit for async apps,
  // but prevents hard to find errors in case of sync
  return new Promise((resolve, reject) => {
    // support cb
    function done (err, ...args) {
      if (err) {
        console.log('!!!!!!!!!!!!', err)
        return next ? next(err) : reject(err)
      }
      return next ? next(null, ...args) : resolve(...args)
    }

    // check that the req is even in the canDo obj
    if (canDo[req]) {
      // if the req was not a function, we can quickly return
      if (canDo[req] === 1) {
        return done(null, true)
      } else if (typeof canDo[req] === 'function') {
        // if the req is a function, try to call the .when method
        // pass Promise params into the .when for sync resolution
        return new Promise((resolve, reject) => {
          canDo[req]({
            params: assign({
              roleId, // for reference
              canDo // for reference
            }, params) // these params are from the user
          }, function (err, res) {
            if (err) {
              console.log('Error!', err)
              return done(err)
            }
            resolve(res)
          })
        })
          .then((res) => done(null, res))
          .catch((err) => {
            console.log(err)
            done(err)
          })
      }
    }
    // canDo[req] does not exist, so access denied
    return done(null, false)
  })
}

module.exports = can
