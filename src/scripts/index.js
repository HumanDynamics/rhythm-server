const createDefaultUser = require('./create-default-user')

module.exports = function () {
  const app = this
  app.configure(createDefaultUser)
}
