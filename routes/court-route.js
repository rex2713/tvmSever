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

  //檢查檔案是否存在public資料夾，如果沒有則從renderDisk複製
  const renderDisk = "/var/data";
  const publicFolder = "/opt/render/project/src/public";
  const copy = (file) => {
    const copyPath = path.join(renderDisk, file);
    const pastPath = path.join(publicFolder, file);
    fs.copyFile(copyPath, pastPath, (err) => {
      if (err) {
        console.log("copy錯誤:" + err);
      } else {
        console.log("copy success");
      }
    });
  };

  fs.readdir(renderDisk, (err, renderFiles) => {
    if (err) {
      console.error(err);
      return;
    }
    for (let i = 0; i < renderFiles.length; i++) {
      if (
        renderFiles[i] !==
        forEach(
          fs.readdir(publicFolder, (err, files) => {
            return files;
          })
        )
      ) {
        copy(renderFiles[i]);
      } else {
        console.log("已存在此檔案");
      }
    }
  });

  try {
    let courtFound = await Court.find({}).exec();
    return res.send(courtFound);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
