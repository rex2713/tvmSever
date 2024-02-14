const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  //檔案儲存位置
  destination: (req, file, cb) => {
    cb(null, "public/userImages"); //存public
  },
  //檔案儲存名稱
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 300000, // 限制非檔案字段大小
  },
});

module.exports = upload;
