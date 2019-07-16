const mongoose = require('mongoose');
// this is used when you have an array of object id's that you will be pushing into.
mongoose.plugin(schema => { schema.options.usePushEach = true; });
const Schema   = mongoose.Schema;


let missingInfo = "Sorry, it look like we're missing an ingredient! Please add this section manually"


const recipeSchema = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId, ref: "User"
  },
  name: {
    type: String, default: missingInfo
  },
  source: {
    type: String
  },
  image: {
    type: String, default: missingInfo
  },
  tags: [
    {type: String}
  ],
  notes: [
    {type: String}
  ],
  instructions: {
    type: String, default: missingInfo
  },
  detailedInstructions: [
    {type: Object, default: missingInfo}
  ],
  ingredientsList: [
    {type: Object, default: missingInfo}
  ],
  rating: {
    type: Number
  },
  snippet: {
    type: String
  }
}, {
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
