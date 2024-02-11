const Joi = require("joi");

//註冊驗證
const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(20).required(),
    email: Joi.string().required().email(),
    password: Joi.string().alphanum().min(6).required(),
    role: Joi.string().default("user").valid("user", "admin"),
  });
  return schema.validate(data);
};

//登入驗證
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().alphanum().min(6).required(),
  });
  return schema.validate(data);
};

//球場資料驗證
const courtValidation = (data) => {
  const schema = Joi.object({
    courtName: Joi.string().required(),
    openingHours: Joi.string().required(),
    courtType: Joi.string().required(),
    courtAddress: Joi.string().required(),
    isPark: Joi.boolean().required(),
    isBus: Joi.boolean().required(),
    isMRT: Joi.boolean().required(),
    price: Joi.string().required(),
    imgPath: Joi.array(),
  });
  return schema.validate(data);
};
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.courtValidation = courtValidation;
