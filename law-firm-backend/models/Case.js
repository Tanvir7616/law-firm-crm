const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  title: String,
  clientName: String,
  description: String,
  status: {
    type: String,
    default: "ongoing"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Case", caseSchema);