const roles = {
  Manager: {
    can: ['view:all'],
    inherits: ['Journalist']
  },
  Editor: {
    can: ['view:all', 'delete:all', 'edit:all', 'publish:all'],
    inherits: ['Journalist']
  },
  Journalist: {
    can: ['view:own', 'edit:own', 'delete:own', 'create']
  }
}

module.exports = roles
