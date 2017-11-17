const winston = require('winston')

exports.hook = function (hook) {
  if (hook.data.meeting !== undefined || hook.data.room === undefined) {
    winston.log('skipping room hook')
    return hook
  }
  winston.log('info', 'hook before roomHook: ', hook.data)
  var query = { query: { room: hook.data.room, active: true } }
  return hook.app.service('meetings').find(query).then((mtgs) => {
    if (mtgs.length === 0) {
      return hook
    }
    hook.data.meeting = mtgs[0]._id
    winston.log('info', 'hook after roomHook: ', hook.data)
    return hook
  })
}
