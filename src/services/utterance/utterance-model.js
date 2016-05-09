'use strict'

// utterance-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const utteranceSchema = new Schema({
  participant: {type: String, ref: 'Participant'},
  meeting: {type: String, ref: 'Meeting'},
  startTime: Date,
  endTime: Date,
  volumes: [{
    timestamp: String,
    vol: Number
  }]
})

const utteranceModel = mongoose.model('utterance', utteranceSchema)

module.exports = utteranceModel
