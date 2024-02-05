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
app.use(cors());

//路由
app.use("/tvm/user", authRoute);
app.use("/tvm/court", courtRoute);
app.use(
  "/tvm/admin",
  passport.authenticate("jwt", { session: false }),
  adminRoute
);

app.listen(8080, () => {
  console.log("Your app is listening on port 8080");
});
