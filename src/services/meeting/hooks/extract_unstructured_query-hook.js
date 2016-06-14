// Extract the meta data from the query string so it is not used
// in the default query. This meta data will be used later in the
// apply_unstructured_query-hook. This was done as feathers does
// not cater for querying meta data via the query string.

'use strict'

// Move the meta query onto the params object so it
// does not interfere with the default REST queries
function extractUnstructuredQuery (hook) {
  if (hook.params.query.meta) {
    hook.params.meta = hook.params.query.meta
    delete hook.params.query.meta
  }
}

module.exports = function (hook) {
  return extractUnstructuredQuery(hook)
}
