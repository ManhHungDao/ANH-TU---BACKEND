// models/MenuItem.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MenuItemSchema = new Schema({
  name: { type: String, required: true }, // Tên menu: "Trang chủ", "Giới thiệu"...
  parent: { type: Schema.Types.ObjectId, ref: "MenuItem", default: null }, // tham chiếu cha (null nếu cấp 1)
  steps: [{ type: Schema.Types.ObjectId, ref: "Step" }], // liên kết các bước theo menu này
  children: [{ type: Schema.Types.ObjectId, ref: "MenuItem" }], // con cấp dưới
  order: { type: Number, default: 0 }, // thứ tự sắp xếp trong danh sách
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MenuItem", MenuItemSchema);
