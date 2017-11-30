var mongoose = require('mongoose');

var HumanSchema = new mongoose.Schema({
  name: {
  	type: String,
  	required: true
  },
  email: {
  	type: String,
  	required: true
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Human', HumanSchema);