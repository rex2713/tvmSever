const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const Default_Upload = process.env.Default_Upload;

const storage = multer.diskStorage({
  //檔案儲存位置
  destination: (req, file, cb) => {
    cb(null, Default_Upload);
  },
  //檔案儲存名稱
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname +
        "_" +
        Date.now() +
        uuidv4() +
        path.extname(file.originalname) +
        ".jpg"
    );
  },
});

const updateCourt = multer({
  storage: storage,
  limits: {
    fieldSize: 300000, // 限制非檔案字段大小
  },
});

module.exports = updateCourt;
