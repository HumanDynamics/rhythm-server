const createDefaultUser = require('./create-default-user')

module.exports = function () {
  const app = this          // eslint-disable-line consistent-this
  app.configure(createDefaultUser)
}
