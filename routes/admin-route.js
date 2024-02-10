const express = require("express");
const router = express.Router();
const Court = require("../models").court;
const courtValidation = require("../validation").courtValidation;
const upload = require("../config/multer");

router.use((req, res, next) => {
  console.log("正在接受一個admin的相關請求");
  next();
});

//建立球場資料
router.post("/addCourt", async (req, res) => {
  //驗證是否為管理員身份
  if (req.user.isUser())
    return res.status(400).send("只有管理員可以新增球場資料呦！");
  //驗證球場資料格式是否符合規範
  let { error } = courtValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let {
    courtName,
    openingHours,
    courtType,
    courtAddress,
    isPark,
    isBus,
    isMRT,
    price,
  } = req.body;
  try {
    let newCourt = new Court({
      courtName,
      openingHours,
      courtType,
      courtAddress,
      isPark,
      isBus,
      isMRT,
      price,
    });
    let saveCourt = await newCourt.save();
    return res.send("儲存球場成功");
  } catch (e) {
    console.log(e);
    return res.status(500).send("儲存新球場失敗");
  }
});

router.delete("/:_id", async (req, res) => {
  //驗證是否為管理員身份
  if (req.user.isUser())
    return res.status(400).send("只有管理員可以刪除球場資料呦！");
  //透過id找到球場資料並刪除
  let { _id } = req.params;
  let courtFound = await Court.findOne({ _id });
  if (!courtFound) return res.status(400).send("找不到此場地");
  //刪除球場
  await Court.deleteOne({ _id })
    .then(() => {
      res.send({
        message: "成功刪除球場",
        球場資訊: courtFound,
      });
    })
    .catch((e) => {
      res.status(500).send("刪除球場失敗");
    });
});
//上傳球場照片API
router.post("/upload", upload.array("file", 4), (req, res) => {
  if (req.user.isUser())
    return res.status(400).send("只有管理員才可以上傳圖片唷！");
  console.log("成功上傳");
});
module.exports = router;
