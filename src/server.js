const app = require("./app");
const connectDatabase = require("./config/database");
require("dotenv").config();

// Kết nối MongoDB
connectDatabase();

// Khởi động server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Bắt lỗi unhandled promise
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
