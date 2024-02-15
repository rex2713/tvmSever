const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  photoSelected: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  skillLevel: {
    type: String,
    enum: ["新手", "系隊", "校隊", "體保"],
  },
  goodAtPosition: {
    type: [String],
    enum: ["主攻", "欄中", "副攻", "舉球", "自由"],
  },
});

//instance methods
//確認身份是否是user
userSchema.methods.isUser = function () {
  return this.role == "user";
};
//確認身份是否是admin
userSchema.methods.isAdmin = function () {
  return this.role == "admin";
};
//驗證密碼
userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

//mongoose middlewares
//若使用者為新用戶，或正在更改密碼，則將密碼進行雜湊處理
userSchema.pre("save", async function (next) {
  //this代表mongodb內的document
  if (this.isNew || this.isModified("password")) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
