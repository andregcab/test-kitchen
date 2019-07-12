const mongoose = require('mongoose');
// this is used when you have an array of object id's that you will be pushing into.
mongoose.plugin(schema => { schema.options.usePushEach = true; });
const Schema   = mongoose.Schema;


const userSchema = new Schema({
  username: {
    type: String,
    unique: true, 
    required: true
  },
  password: {
    type: String,
    required: true
  },
  savedRecipes: {
    type: Array
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;