const q = require('./lib/query.js')
const p = require('./lib/pg_pool.js')

exports.get_pool = p.get_pool
exports.get_company = q.get_company
