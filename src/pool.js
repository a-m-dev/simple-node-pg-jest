const pg = require("pg");

// Normally this is what we do...
// const pool = new pg.Pool({
//   host: "",
//   post: "",
//   user: "",
//   password: "",
// });

// module.exports = pool;

// --------------------------------
// but because of tests we do This:
class Pool {
  _pool = null;

  connect(options) {
    this._pool = new pg.Pool(options);
    return this._pool.query("SELECT 1 + 1"); // make sure we have valid connection to db
  }

  close() {
    return this._pool.end();
  }

  query(sql, params) {
    return this._pool.query(sql, params);
  }
}

module.exports = new Pool();
