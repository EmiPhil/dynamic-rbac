import {
  assign,
  mergeWith,
  pick,
  without,
  uniqBy
} from 'lodash'

// Used with mergeWith to concat arrays of same prop
// See https://lodash.com/docs/4.17.4#mergeWith
function customizer (obj, src) {
  if (Array.isArray(obj)) {
    // only use the first appearance of a role
    return uniqBy(obj.concat(src), (item) => {
      return item.name || item
    })
  }
}

// keyword is used as the prop to find the next targets in hydration
export const inheritance = ({ keyword = 'inherits' } = {}) => {
  function hydrator (rbacl = {}, target = '', result = {
    incl: [],
    [keyword]: []
  }, cycles = 0, initTarget = target) {
    const replace = (target) => hydrator(rbacl, target)

    if (target) {
      let res = mergeWith({}, result, { incl: [target] }, rbacl[target], customizer)

      const nextTarget = res[keyword].filter(role => !res.incl.includes(role))[0]

      res = assign({}, res, {
        [keyword]: without(res[keyword], nextTarget)
      })

      return hydrator(rbacl, nextTarget, res, cycles + 1, initTarget)
    } else {
      result = pick(result, ['incl', 'can'])

      return assign(replace, {
        valueOf () {
          return result
        },

        toString () {
          return `rbacl[${initTarget}] => ${JSON.stringify(result)}`
        },

        get res () {
          return result
        },

        get target () {
          return initTarget
        },

        get cycles () {
          return cycles
        },

        get keyword () {
          return keyword
        },

        replace,
        constructor: hydrator
      })
    }
  }

  hydrator.of = hydrator

  return hydrator
}

const hydrator = inheritance()
export default hydrator
