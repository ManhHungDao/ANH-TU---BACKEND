const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.DB_LOCAL_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((cons) => {
      console.log(`MongoDB Database connected`);
    });
};

module.exports = connectDatabase;
