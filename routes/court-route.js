const express = require("express");
const router = express.Router();
const Court = require("../models").court;
const courtValidation = require("../validation").courtValidation;
const fs = require("fs");
const path = require("path");

router.use((req, res, next) => {
  console.log("正在接受一個court-route的相關請求");
  next();
});

//獲得資料庫中所有球場資料
router.get("/", async (req, res) => {
  console.log("正在獲取球場資料");

  //測試複製圖檔
  const renderDisk = "/var/data";
  const publicFolder = "/opt/render/project/src/public";
  fs.readdir(publicFolder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    } else {
      console.log(files);
    }
  });
  fs.readdir(renderDisk, (err, files) => {
    if (err) {
      console.error("Error reading render disk:", err);
      return;
    }
    console.log(files);
    files.forEach((file) => {
      const copyPath = path.join(renderDisk, file);
      const pastPath = path.join(publicFolder, file);
      fs.copyFile(copyPath, pastPath, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("success copy");
        }
      });
    });
  });

  try {
    let courtFound = await Court.find({}).exec();
    return res.send(courtFound);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
