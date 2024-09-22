const app = require("./src/app");
const { DEFAULT_CONNECTION_OPTIONS } = require("./src/constants");
const pool = require("./src/pool");

pool
  .connect(DEFAULT_CONNECTION_OPTIONS)
  .then(() => {
    app().listen(3005, () => {
      console.log("Listening on port 3005!");
    });
  })
  .catch((err) => {
    console.log({ err });
  });
