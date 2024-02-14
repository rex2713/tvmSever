const express = require("express");
const router = express.Router();
const Court = require("../models").court;
const courtValidation = require("../validation").courtValidation;
const upload = require("../config/multer-court");

router.use((req, res, next) => {
  console.log("正在接受一個admin的相關請求");
  next();
});

//建立球場資料(包含上傳四張照片)
router.post("/addCourt", upload.array("file", 4), async (req, res) => {
  //驗證是否為管理員身份
  if (req.user.isUser())
    return res.status(400).send("只有管理員可以新增球場資料呦！");
  //驗證球場資料格式是否符合規範
  let { error } = courtValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //將四張照片路徑資料取出
  console.log(req.files);
  const imgPath = req.files.map(
    (file) => "http://localhost:8080/images/" + file.filename
  );
  console.log(imgPath);

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
      imgPath,
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

module.exports = router;
