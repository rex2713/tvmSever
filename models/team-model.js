const { date } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const teamSchema = new Schema({
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
  },
  date: {
    type: String,
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
  teamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  teamMember: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("team", teamSchema);
