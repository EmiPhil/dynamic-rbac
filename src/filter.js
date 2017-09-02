function filterRequests ({
  id = '',
  reqs = [],
  keys = { name: '', rest: [] },
  acl = {}
} = {}) {
  return new Promise(async (resolve, reject) => {
    let result = []
    for (let i = 0; i < reqs.length; i++) {
      let req = reqs[i]
      let args = typeof req === 'string'
        ? [req]
        : [req[keys.name], ...req[keys.rest]]
      try {
        let check = await acl.can(id, ...args)
        if (check) {
          result = result.concat([req])
        }
      } catch (err) {
        return reject(err)
      }
    }
    return resolve(result)
  })
}

// id and acl will be passed in by lonamic
// reqs is an array of the ids or id objects requested
// then is an optional callback
// keys map the id object:
//   name refers to the id string
//   rest refers to the args to pass to .can(id, ...rest)
async function filter ({
  id = '',
  acl = {}
} = {}, reqs = [], then, keys = {
  name: 'name',
  rest: 'rest'
}) {
  // allow 3 args with no cb
  if (typeof then === 'object') {
    keys = then
    then = undefined
  }
  // wait for filterRequests to loop through the .can of each req
  try {
    // req.can is sync!
    const result = await filterRequests({
      id, reqs, keys, acl
    })
    // if cb return to cb
    return then ? then(null, result) : result
  } catch (err) {
    if (then) { return then(err) }
    throw (err)
  }
}

module.exports = {
  filter, filterRequests
}
