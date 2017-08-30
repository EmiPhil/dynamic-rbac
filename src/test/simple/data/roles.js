const posts = require('./posts')

const ownsPost = (params = {}, override = '') => {
  if (params.canDo[override]) return true
  return posts[params.postId].by === params.userId
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
      name: 'post:view',
      when ({ params }) {
        return ownsPost(params, 'post:view:all')
      }
    }, {
      name: 'post:edit',
      when ({ params }) {
        return ownsPost(params, 'post:edit:all')
      }
    }, {
      name: 'post:delete',
      when ({ params }) {
        return ownsPost(params, 'post:delete:all')
      }
    }, 'create']
  }
}

module.exports = roles
