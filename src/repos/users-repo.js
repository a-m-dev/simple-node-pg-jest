const pool = require("../pool");
const toCamelCase = require("./utils/to-camel-case");

// OPT #01
// module.exports = {
//   find() {},
//   findById() {},
//   insert() {},
// };

// OPT #02
// class UserRepo {
//   find() {}
//   findById() {}
//   insert() {}
// }

// module.exports = new UserRepo(); // export a singleton

// OPT #03
class UserRepo {
  static async find() {
    const { rows } = await pool.query(`SELECT * FROM users;`);

    return toCamelCase(rows);
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT * from users where id = $1 LIMIT 1`,
      [id]
    );
    return toCamelCase(rows)[0];
  }

  static async insert(username, bio) {
    const { rows } = await pool.query(
      `INSERT INTO users (username, bio) VALUES ($1, $2) RETURNING *`,
      [username, bio]
    );
    return toCamelCase(rows)[0];
  }

  static async update(id, username, bio) {
    const { rows } = await pool.query(
      `UPDATE users SET username = $1, bio = $2 where id = $3 RETURNING *`,
      [username, bio, id]
    );
    return toCamelCase(rows)[0];
  }

  static async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [id]
    );

    return toCamelCase(rows)[0];
  }
}

module.exports = UserRepo;
