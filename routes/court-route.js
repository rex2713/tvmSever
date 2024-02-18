const express = require("express");
const router = express.Router();
const Court = require("../models").court;
// const courtValidation = require("../validation").courtValidation;

router.use((req, res, next) => {
  console.log("正在接受一個court-route的相關請求");
  next();
});

//獲得資料庫中所有球場資料
router.get("/", async (req, res) => {
  console.log("正在獲取球場資料");
  try {
    let courtFound = await Court.find({}).exec();
    return res.send(courtFound);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
