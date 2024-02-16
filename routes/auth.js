const router = require("express").Router();
const User = require("../models").user;
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const updatesValidation = require("../validation").updatesValidation;
const jwt = require("jsonwebtoken");
const upload = require("../config/multer-user");
const passport = require("passport");
const { user } = require("../models");
require("../config/passport")(passport);
require("dotenv").config();

const Default_URI = process.env.Default_URI;

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
router.post("/register", upload.single("file"), async (req, res) => {
  //確認資料是否符合規範
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  console.log("資料格式驗證成功");

  //確認信箱是否已被註冊
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此email已被註冊");
  console.log("email驗證成功");

  //註冊新用戶

  // const imgPath = "http://localhost:8080/userImages/" + req.file.filename;
  // console.log(imgPath);
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

//取得當前用戶資料
router.get(
  "/getCurrentUser",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // console.log(req.user);
  }
);

//更新用戶資料
router.patch(
  "/update/:_id",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  async (req, res) => {
    let { _id } = req.params;
    let userFound = await User.findOne({ _id });

    //確認資料格式是否符合規範
    req.body.goodAtPosition = req.body.goodAtPosition.split(","); //將資料格式轉換成陣列
    // console.log(typeof req.body.goodAtPosition);
    let { error } = updatesValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    // console.log("更新資料格式正確");
    if (req.body.photoSelected) {
      let photoID = req.body.photoSelected;
      switch (photoID) {
        case "men1":
          req.body.photoSelected = Default_URI + "/userImages/men1.png";
          break;
        case "men2":
          req.body.photoSelected = Default_URI + "/userImages/men2.png";
          break;
        case "men3":
          req.body.photoSelected = Default_URI + "/userImages/men3.png";
          break;
        case "men4":
          req.body.photoSelected = Default_URI + "/userImages/men4.png";
          break;
        case "men5":
          req.body.photoSelected = Default_URI + "/userImages/men5.png";
          break;
        case "men6":
          req.body.photoSelected = Default_URI + "/userImages/men6.png";
          break;
        case "girl1":
          req.body.photoSelected = Default_URI + "/userImages/girl1.png";
          break;
        case "girl2":
          req.body.photoSelected = Default_URI + "/userImages/girl2.png";
          break;
        case "girl3":
          req.body.photoSelected = Default_URI + "/userImages/girl3.png";
          break;
        case "girl4":
          req.body.photoSelected = Default_URI + "/userImages/girl4.png";
          break;
        case "girl5":
          req.body.photoSelected = Default_URI + "/userImages/girl5.png";
          break;
        case "girl6":
          req.body.photoSelected = Default_URI + "/userImages/girl6.png";
          break;
      }
    } else {
      req.body.photoSelected = Default_URI + "/images/" + req.file.filename;
    }
    try {
      let updateUser = await User.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({ message: "更新資料成功", updateUser });
    } catch (e) {
      console.error(e);
    }
  }
);
module.exports = router;
