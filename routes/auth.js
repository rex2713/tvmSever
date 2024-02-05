const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const User = require("../models").user;
const loginValidation = require("../validation").loginValidation;
const jwt = require("jsonwebtoken");

//middleware
router.use((req, res, next) => {
  console.log("正在接收一個auth相關的請求");
  next();
});

//測試
router.get("/test", (req, res) => {
  console.log("成功連接auth頁面");
});

//註冊API
router.post("/register", async (req, res) => {
  //確認資料是否符合規範
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  console.log("資料格式驗證成功");

  //確認信箱是否已被註冊
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此email已被註冊");
  console.log("email驗證成功");

  //註冊新用戶
  let { username, email, password } = req.body;
  let newUser = new User({ username, email, password });
  try {
    let saveUser = await newUser.save();
    return res.send({
      message: "成功註冊用戶",
      saveUser,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send("無法儲存用戶");
  }
});

//登入API
router.post("/login", async (req, res) => {
  //確認資料格式是否符合規範
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  console.log("登入資料格式正確");

  //確認用戶信箱是否存在
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser)
    return res.status(400).send("email address is not registered");
  //驗證密碼
  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);
    if (isMatch) {
      //驗證正確，製作json web token
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "成功登入",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      res.status(401).send("wrong password");
    }
  });
});

module.exports = router;
