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
const fs = require("fs");
const path = require("path");
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
app.use(
  cors({
    origin: ["http://localhost:5173", "https://tvm-0wj4.onrender.com"],
  })
); //跨域鬆綁
app.use(express.static("public")); //公開public資料夾（提供前端訪問權限）

//路由
app.use("/tvm/user", authRoute);
app.use("/tvm/court", courtRoute);
app.use(
  "/tvm/admin",
  passport.authenticate("jwt", { session: false }),
  adminRoute
);

//處理render部署永久磁碟
app.get("/", (req, res) => {
  //檢查圖檔是否存在public資料夾，如果沒有則從renderDisk複製
  const renderDisk = "/var/data";
  const publicFolder = "/opt/render/project/src/public/images";
  //定義複製檔案函式
  const copy = (file) => {
    const copyPath = path.join(renderDisk, file);
    const pastPath = path.join(publicFolder, file);
    fs.copyFile(copyPath, pastPath, (err) => {
      if (err) {
        console.log("copy錯誤:" + err);
      } else {
        console.log("copy-success");
      }
    });
  };

  fs.readdir(renderDisk, (err, renderFiles) => {
    if (err) {
      console.error("讀取renderDisk錯誤:" + err);
      return;
    }
    fs.readdir(publicFolder, (err, publicFiles) => {
      //進行迴圈比對檔案是否存在
      for (let i = 0; i < renderFiles.length; i++) {
        if (err) {
          console.error("讀取publicFolder錯誤:" + err);
          return;
        }
        //不存在則複製到publicFolder
        if (!publicFiles.includes(renderFiles[i])) {
          copy(renderFiles[i]);
        } else {
          console.log("已存在此檔案");
        }
      }
    });
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
