const express = require("express");
const router = express.Router();
const Court = require("../models").court;
const fs = require("fs");
const courtValidation = require("../validation").courtValidation;
const upload = require("../config/multer-court");
const updateCourt = require("../config/multer-court-update");
require("dotenv").config();
const path = require("path");

const Default_URI = process.env.Default_URI;

router.use((req, res, next) => {
  console.log("正在接受一個admin的相關請求");
  next();
});

//建立球場資料(包含上傳四張照片)
router.post("/addCourt", upload.array("file", 4), async (req, res) => {
  //驗證是否為管理員身份
  if (req.user.isUser())
    return res.status(403).send("只有管理員可以新增球場資料呦！");
  //驗證球場資料格式是否符合規範
  let { error } = courtValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //將四張照片路徑資料取出
  console.log(req.files);
  const imgPath = req.files.map(
    (file) => Default_URI + "/images/" + file.filename
  );
  // console.log(imgPath);

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

//更新球場資料
router.patch(
  "/updateCourt/:_id",
  updateCourt.array("file", 4),
  async (req, res) => {
    //驗證是否為管理員身份
    if (req.user.isUser())
      return res.status(400).send("只有管理員可以刪除球場資料呦！");
    //透過id找到球場資料
    let { _id } = req.params;
    let courtFound = await Court.findOne({ _id });
    if (!courtFound) return res.status(400).send("找不到此場地");
    // console.log(req.body);
    //將四張照片路徑資料取出
    // console.log(courtFound.imgPath);
    const newImgPath = req.files.map(
      (file) => (file.path = Default_URI + "/images/" + file.filename)
    );

    // console.log(courtFound.imgPath);
    console.log(newImgPath);

    //刪除舊的照片檔案
    let oldImgPath = courtFound.imgPath.map((path) => {
      return path.replace(Default_URI, "");
    });
    oldImgPath = oldImgPath.map((oldPath) => {
      return path.join(__dirname, "../", "public", oldPath);
    });
    console.log(oldImgPath);

    oldImgPath.forEach(async (path) => {
      // 檔案管理
      fs.unlink(path, (err) => {
        if (err) {
          console.error(`Error deleting file: ${path}`, err);
        } else {
          console.log(`File deleted successfully: ${path}`);
        }
      });
    });

    courtFound.imgPath = newImgPath;
    // console.log(courtFound.imgPath);

    await courtFound
      .save()
      .then(() => {
        res.send("成功儲存照片");
      })
      .catch((e) => {
        res.status(500).send("儲存新照片失敗");
      });

    //更新球場
    // await courtFound
    //   .save({ _id })
    //   .then(() => {
    //     res.send({
    //       message: "成功更新球場",
    //       球場資訊: courtFound,
    //     });
    //   })
    //   .catch((e) => {
    //     res.status(500).send("更新球場失敗");
    //   });
  }
);

//刪除球場資料
router.delete("/:_id", async (req, res) => {
  //驗證是否為管理員身份
  if (req.user.isUser())
    return res.status(400).send("只有管理員可以刪除球場資料呦！");
  //透過id找到球場資料
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
