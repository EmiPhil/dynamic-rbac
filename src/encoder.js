import { Buffer } from 'buffer/'
import _ from 'lodash'

export const encode = (roles, defaults) => {
  const obj = {
    roles: _.assign({}, roles),
    defaults: _.assign({}, defaults)
  }
  return Buffer.from(JSON.stringify(obj))
}

export const decode = (buf) => {
  const objString = Buffer.from(buf).toString()
  return JSON.parse(objString)
}
