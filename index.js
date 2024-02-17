const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const authRoute = require("./routes").auth;
const courtRoute = require("./routes").court;
const adminRoute = require("./routes").admin;
const passport = require("passport");
require("./config/passport")(passport);

const Default_URI = process.env.Default_URI;

//資料庫連接
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("成功連接MongoDB");
  })
  .catch((e) => {
    console.log(e);
    console.log("無法連接Mongodb");
  });

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); //公開public資料夾（提供前端訪問權限）

//跨域鬆綁
app.use(
  cors({
    origin: ["http://localhost:5173", "https://tvm-0wj4.onrender.com"],
  })
);
//處理預檢請求(Preflight Request)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://tvm-0wj4.onrender.com");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Header",
    "Content-Type, Authorization, token, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);
  next();
});

//路由
app.use("/tvm/user", authRoute);
app.use("/tvm/court", courtRoute);
app.use(
  "/tvm/admin",
  passport.authenticate("jwt", { session: false }),
  adminRoute
);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
