const app = require("./app");
const connectDatabase = require("./config/database");

connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server Started on PORT: ${process.env.PORT} in  ${process.env.NODE_ENV}`
  );
});

//Handle unhandle promise rejection error
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down the server due to unhandled Promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
