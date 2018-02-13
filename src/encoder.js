import * as BufModule from 'buffer/'
import _ from 'lodash'

const Buf = BufModule.Buffer

export const encode = (roles, defaults) => {
  const obj = {
    roles: _.assign({}, roles),
    defaults: _.assign({}, defaults)
  }
  return Buf.from(JSON.stringify(obj))
}

export const decode = (buf) => {
  const objString = Buf.from(buf).toString()
  return JSON.parse(objString)
}
