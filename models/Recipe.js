const mongoose = require('mongoose');
// this is used when you have an array of object id's that you will be pushing into.
mongoose.plugin(schema => { schema.options.usePushEach = true; });
const Schema   = mongoose.Schema;


const recipeSchema = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId, ref: "User"
  },
  name: {
    type: String
  },
  source: {
    type: String
  },
  image: {
    type: String
  },
  tags: {
    type: Array
  },
  notes: {
    type: Array
  },
  instructions: {
    type: String
  },
  detailedInstructions: {
    type: Array
  }
}, {
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;