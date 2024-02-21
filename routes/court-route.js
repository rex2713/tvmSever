const express = require("express");
const router = express.Router();
const Court = require("../models").court;
const Team = require("../models").team;
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
//獲得指定id的球場資料
router.get("/getCourt/:_id", async (req, res) => {
  console.log("正在取得指定id球場資料");
  try {
    let { _id } = req.params;
    let courtFound = await Court.findOne({ _id }).populate("teams");
    console.log(courtFound);
    res.send(courtFound);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
