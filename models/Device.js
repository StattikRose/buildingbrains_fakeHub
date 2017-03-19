const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')
const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
  link: { type: String, unique: true },
  state: String,
  type: String,
  category: String,
}, { timestamps: true })

const Device = mongoose.model('Device', deviceSchema)
module.exports = Device
