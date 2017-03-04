'use strict';

// frame-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var frameDataSchema = new Schema(
  {
    data: [Number],
    height: Number,
    width: Number,
    timestamp: Date
  }
)

const frameSchema = new Schema({
  participant: {type: String, ref: 'Participant'},
  meeting: {type: String, ref: 'Meeting'},
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now },
  data: [frameDataSchema],
  timestamp: Date
});

const frameModel = mongoose.model('frame', frameSchema);

module.exports = frameModel;
