const posts = require('./posts')

const ownsPost = (params, override, next) => {
  if (params.canDo[override]) return next(null, true)
  return next(
    null, posts[params.postId].by === params.userId
  )
}

const roles = {
  Manager: {
    can: ['post:view:all'],
    inherits: ['Journalist']
  },
  Editor: {
    can: ['post:view:all', 'post:delete:all', 'post:edit:all', 'post:publish'],
    inherits: ['Journalist']
  },
  Journalist: {
    can: [{
      name: 'post:edit',
      when ({ params }, next) {
        return ownsPost(params, 'post:edit:all', next)
      }
    }, 'create']
  }
}

module.exports = roles
