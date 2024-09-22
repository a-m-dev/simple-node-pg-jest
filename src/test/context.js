const { randomBytes } = require("crypto");
const format = require("pg-format");
const { default: migrate } = require("node-pg-migrate");
const pool = require("../pool");
const { DEFAULT_CONNECTION_OPTIONS } = require("../constants");

// this is advanced and absolutely not related postgres
// just test setup!
class Context {
  constructor(rolename) {
    this.roleName = rolename;
  }

  static async build() {
    // manually run migrations for `socialnetwork-test` db
    // ```DATABASE_URL=postgres://USERNAME:PASSWORD@localhost:5432/socialnetwork-test npm run migrate up```
    // in order to get test database ready for tests
    // ------------------------------------------------------------------------------------------------------------

    // 1. randomly generate a rolename to connect to PG
    const roleName = "a" + randomBytes(4).toString("hex");

    // 2. connect to PG as usual
    await pool.connect(DEFAULT_CONNECTION_OPTIONS);

    // 3. create a new role
    await pool.query(
      // old way: `CREATE SCHEMA %{roleName} WITH LOGIN PASSWORD '${roleName}'`
      // ---
      // we do this because we dont want to have sql injection in these TEST queries
      // which it's percentage is 0% but we want to make sure that never happens
      // the reason we use format is that -> using old version ^, we only can replace values
      // with $1, $2 and ..., NOT IDENTIFIERS like schema name and things like that
      // so using format does it!

      // %I -> we want substiture some identifier
      // %L -> we want substitude some literal value
      format("CREATE ROLE %I WITH LOGIN PASSWORD %L", roleName, roleName)
    );

    // 4. create a schema with same name
    await pool.query(
      // old way: `CREATE SCHEMA ${roleName} AUTHORIZATION ${roleName}`
      // ---
      format(`CREATE SCHEMA %I AUTHORIZATION %I`, roleName, roleName)
    );

    // 5. disconnect entierly from PG
    await pool.close();

    // ---
    // now in order to connect to newly created TEST schema...
    // 1. Run our migrations in new Schema to make sure user table exists
    await migrate({
      schema: roleName,
      direction: "up",
      log: () => {},
      noLock: true,
      dir: `migrations`,
      databaseUrl: {
        host: "localhost",
        port: 5432,
        database: "socialnetwork-test",
        user: roleName, // we defined this a few steps back ^
        password: roleName,
      },
    });

    // 2. Connect to PG as newly created role
    await pool.connect({
      host: "localhost",
      port: 5432,
      database: "socialnetwork-test",
      user: roleName,
      password: roleName,
    });

    // return new build of context
    return new Context(roleName);
  }

  async reset() {
    pool.query(`
      DELETE FROM users;
      `);
    // or any other tables at the same time like:
    // DELETE FROM users;
    // DELETE FROM tableA;
    // DELETE FROM tableB;
    // ...
  }

  // basically ... clean up
  async close() {
    // 1. disconnect from pg as role and created scheam and user
    await pool.close();

    // 2. reconnect as our root user
    await pool.connect(DEFAULT_CONNECTION_OPTIONS);

    // 3. delete the role and schema we created (as root user)
    await pool.query(format("DROP SCHEMA %I CASCADE;", this.roleName));
    await pool.query(format("DROP ROLE %I", this.roleName));

    // 4. disconnect as root user
    await pool.close();
  }
}

module.exports = Context;
