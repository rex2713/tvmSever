const { boolean } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const courtSchema = new Schema({
  courtName: {
    type: String,
    required: true,
  },
  openingHours: {
    type: String,
    required: true,
  },
  courtType: {
    type: String,
    required: true,
  },
  courtAddress: {
    type: String,
    required: true,
  },
  isPark: {
    type: Boolean,
    required: true,
  },
  isBus: {
    type: Boolean,

    required: true,
  },
  isMRT: {
    type: Boolean,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 5,
  },
});

module.exports = mongoose.model("Court", courtSchema);
