import mongoose from "mongoose";

const Schema = mongoose.Schema;
const skillsSub = new Schema({
  name: {
    type: String,
  },
});
const experienceSub = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
});

let Users = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: "User",
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  phone: {
    type: String,
  },
  about: {
    type: String,
  },

  skills: [skillsSub],
  experience: [experienceSub],
});

module.exports = Users = mongoose.model("Users", Users);
