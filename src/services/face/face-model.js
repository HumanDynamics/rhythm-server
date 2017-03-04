'use strict'
// face-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var faceDataSchema = new Schema(
  {
    x: [Number],
    y: [Number],
    timestamp: Date
  })

const faceSchema = new Schema({
  participant: {type: String, ref: 'Participant'},
  meeting: {type: String, ref: 'Meeting'},
  timestamp: Date,
  data: faceDataSchema
})

const faceModel = mongoose.model('face', faceSchema)

module.exports = faceModel
