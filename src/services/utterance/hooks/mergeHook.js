'use strict'

const winston = require('winston')

exports.hook = function (hook) {
  return hook.app.service('utterances').find({
    query: {
      meeting: hook.data.meeting,
      participant: hook.data.participant,
      $sort: {endTime: -1},
      $limit: 1
    }
  }).then((lastUtterances) => {
    if (lastUtterances.length === 0) {
      // nothing to see here
      return hook
    }

    let utter = lastUtterances[0]
    // if the new utterance started < .5 seconds after the last one ended,
    // merge them pls
    if ((hook.data.startTime - utter.endTime) < 500) {
      winston.log('info', 'found utterance to be merged')
      utter.volumes = utter.volumes || []
      hook.app.service('utterances').patch(utter._id, {
        endTime: hook.data.endTime,
        volumes: utter.volumes.concat(hook.data.volumes || [])
      }).then((patchedMtg) => {
        winston.log('info', 'updated utterance instead of creating', JSON.stringify(patchedMtg))
      })

      // drop the new utterance
      hook.data = {}
      hook.result = {}
    }

    return hook
  })
}
