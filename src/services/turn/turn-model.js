'use strict'

// turn-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const turnSchema = new Schema({
  _id: String,
  meeting: {type: String, ref: 'Meeting'},
  timestamp: Date,
  from: Date,
  to: Date,
  room: String,
  transitions: Number,
  turns: [{
    participant: {type: String, ref: 'participant'},
    turns: Number
  }]
})

const turnModel = mongoose.model('turn', turnSchema)

module.exports = turnModel
