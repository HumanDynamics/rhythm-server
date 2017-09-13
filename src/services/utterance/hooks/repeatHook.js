const _ = require('underscore')
const winston = require('winston')

function dateDiff (d1, d2) {
  return Math.abs(new Date(d1).getTime() - new Date(d2).getTime())
}

exports.hook = function (hook) {
  hook.app.service('utterances').find(
    {
      query: {
        $and: [{meeting: hook.data.meeting},
               {participant: hook.data.participant}]
      }
    }).then((foundUtterances) => {
      var timeMatchThreshold = 1 * 1000 // threshold for times being "matched", in ms
      // there are some talk events from this participant
      // filter them, find if any are very close:
      winston.log("info", "utterances found: " + foundUtterances.length);
      var matches = _.filter(foundUtterances,
                             function (utterance) {
                               var startDiff = dateDiff(utterance.startTime,
                                                          hook.data.startTime)
                               var endDiff = dateDiff(utterance.endTime,
                                                        hook.data.endTime)
                               console.log(startDiff);
                               console.log(utterance.startTime);
                               console.log(hook.data.startTime);
                               console.log(utterance.endTime);
                               return (startDiff < timeMatchThreshold ||
                                       endDiff < timeMatchThreshold)
                             })
      if (matches.length === 0) {
        winston.log('info', 'Inserting new talking history data, not a repeat...')
        return hook
      } else {
        //TODO i think it's worth considering if we should merge the speaking events
        // instead of just dropping them
        // what if i take a one second pause during my turn?
        winston.log('info', 'Tried to insert repeat talking history data! Nuh-Uh')
        hook.data = {}
        return hook
      }
    })
}
