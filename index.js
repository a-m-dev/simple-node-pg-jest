const app = require("./src/app");
const pool = require("./src/pool");

pool
  .connect({
    host: "localhost",
    port: 5432,
    database: "socialnetwork",
    user: "MY_USERNAME_HERE",
    password: "MY_PASSWORD_HERE",
  })
  .then(() => {
    app().listen(3005, () => {
      console.log("Listening on port 3005!");
    });
  })
  .catch((err) => {
    console.log({ err });
  });
