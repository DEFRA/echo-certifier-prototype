/*

Provide default values for user session data. These are automatically added
via the `autoStoreData` middleware. Values will only be added to the
session if a value doesn't already exist. This may be useful for testing
journeys where users are returning or logging in to an existing application.

============================================================================

Example usage:

"full-name": "Sarah Philips",

"options-chosen": [ "foo", "bar" ]

============================================================================

*/
var cases_list = require('./cases.json')
var cases_list_v2 = require('./cases_v2.json')
module.exports = {
  "transport_type": [],
  "cases": cases_list,
  "cases_v2" : cases_list_v2,
  "uploaded_files": [{"name": "test_support.docx","description": "some wonderful text","ID":1}],
  "file_id_count" : 1,
  "filter_status" : [],
  "cert_id": 14
  // Insert values here

}
