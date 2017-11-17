//  Cycles through any meta data passed via the query string
//  and filters out records not matching the meta data.

'use strict'

const _ = require('underscore')

// Filter the result set with the meta query if one exists
function applyUnstructuredQuery (hook) {
  if (hook.params.meta) {
    hook.result = hook.result.filter((current) => {
      if (current.meta !== undefined) {
        var match = true
        _.each(_.keys(hook.params.meta), function (key) {
          if (current.meta == null || current.meta[key] !== decodeURI(hook.params.meta[key])) {
            match = false
          }
        })
        return match
      }
    })
  }
}

module.exports = function (hook) {
  return applyUnstructuredQuery(hook)
}
