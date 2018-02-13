import _ from 'lodash'

const reduce = async (array, fn, acc) => {
  for (const item of array) acc = await fn(acc, item)
  return acc
}

export async function filterRequests ({
  id = '',
  reqs = [],
  keys = { name: '', rest: [] },
  acl = {}
} = {}) {
  try {
    return await reduce(reqs, async (acc, req) => {
      const args = _.isString(req) ? [req] : [req[keys.name], ...req[keys.rest]]
      return await acl.can(id, ...args) ? _.concat(acc, req) : acc
    }, [])
  } catch (err) { throw err }
}

// id and acl will be passed in by lonamic
// reqs is an array of the ids or id objects requested
// then is an optional callback
// keys map the id object:
//   name refers to the id string
//   rest refers to the args to pass to .can(id, ...rest)
export async function filter ({
  id = '',
  acl = {}
} = {}, reqs = [], cb, keys = {
  name: 'name',
  rest: 'rest'
}) {
  // allow 3 args with no cb
  if (_.isPlainObject(cb)) {
    keys = cb
    cb = undefined
  }
  // wait for filterRequests to loop through the .can of each req
  try {
    // req.can is sync!
    const result = await filterRequests({ id, reqs, keys, acl })
    // if cb return to cb
    return cb ? cb(null, result) : result
  } catch (err) {
    if (cb) { return cb(err) }
    throw (err)
  }
}

export default filter
