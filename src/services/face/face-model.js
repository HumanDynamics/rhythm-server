'use strict'

// face-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const faceSchema = new Schema({
  participant: {type: String, ref: 'Participant'},
  meeting: {type: String, ref: 'Meeting'},
  timestamp: Date,
  face_delta: Number,
  norm_smile: Number,
  delta_array: [Number],
  x_array: [Number],
  y_array: [Number]
})

const faceModel = mongoose.model('face', faceSchema)

module.exports = faceModel
