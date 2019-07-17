const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const uploadMagic = require("../config/cloudinary-setup");
const mongoose = require("mongoose");
const ensureLogin = require("connect-ensure-login");
var unirest = require("unirest");

// ***-=-=-=-=-Using AXIOS on the front end=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-****

//Instead of rendering the page with all the celebs, what we are doing now
//is getting the info and converting it to json
// router.get('/axios', /*ensureLogin.ensureLoggedIn(),*/ (req, res, next) => {
//   Celebrity.find()
//   .then((theWholeDBArray)=>{
//     res.json(theWholeDBArray);
//   })
//   .catch((err)=>{
//     next(err);
//   })
// });

// //I still need to render the file itself, this is basically the new "celebrities" page
// router.get('/axios-new', (req, res, next)=> {
//   res.render('celebrities/axiosCelebAdd');
// })

//before working on the front end, we were passing the information back through here as a POST route
//and then making sure the req.body matches the model and then using the .create method to add it
//to the database and then redirecting to the new celebrity using the ID (I could have also
//routed to any other page).
//Now what we are doing is creating it and not rendering anything becuase the script.js file
//is allowing us to show the information immediatly on the page without reloading
// router.post('/axios', (req, res, next)=>{
//   const {name, occupation, catchPhrase} = req.body;
//   // this is like saying
//   // const title = req.body.title;
//   // const descrtiption = req.body.descrition;
//   // etc.
//   let newCeleb = {name: name, occupation: occupation, catchPhrase: catchPhrase }
//   Celebrity.create(newCeleb)
//   .then((newlyCreatedCeleb)=>{

//     res.json({message: 'Sucessfuly Created Celeb'});

//   })
//   .catch((err)=>{
//       res.json(err);

//   })
// })

// ***-=-=-=-=-Using AXIOS on the front end=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-****
//V
//V
//V
//V
//**=-=-=-=-=-=Using EXPRESS on the back end */

router.get(
  "/user",
  /*ensureLogin.ensureLoggedIn(),*/ (req, res, next) => {
    //this will render the user homepage with all the user's recipes

    Recipe.find({ ownerId: mongoose.Types.ObjectId(req.user._id) })
      .then(allUserRecipes => {
        // console.log("=-=-=-=-=-=-=-=-=", allUserRecipes)
        res.render("recipe-views/userHomepage", {
          userRecipes: allUserRecipes
        });

        // const recpie = new Recipe({name: doc.name, instructions: doc.analalyzed[0].steps})
      })
      .catch(err => {
        next(err);
      });
  }
);

router.get("/newRecipe", (req, res, next) => {
  //this renders the page to enter completely new recipe information from scratch
  res.render("recipe-views/edit"); //the view file to enter the info
});

router.post(
  "/create-new-recipe",
  uploadMagic.single("image"),
  (req, res, next) => {
    //takes all the new recipe information to upload to database
    console.log(req.body);
    let ownerId = req.user._id;
    let name = req.body.name;
    let source = req.body.source;
    let tags = req.body.tags;
    let notes = req.body.notes;
    let instructions = req.body.instructions;
    let detailedInstructions = req.body.detailedInstructions;
    let ingredientsList = req.body.ingredientsList;
    let rating = req.body.rating;
    let snippet = req.body.snippet;
    // let image = req.file.url || '';

    let newRecipe = {
      ownerId: ownerId,
      name: name,
      source: source,
      tags: tags,
      /*image: image,*/ notes: notes,
      instructions: instructions,
      detailedInstructions: detailedInstructions,
      ingredientsList: ingredientsList,
      snippet: snippet,
      rating: rating
    };
    console.log(newRecipe);
    Recipe.create(newRecipe)
      .then(newlyCreatedRecipe => {
        req.flash("error", `Successfully added ${newlyCreatedRecipe.name}`);
        // console.log(newlyCreatedRecipe._id)
        res.redirect(`/recipes/userRecipe/${newlyCreatedRecipe._id}`);
      })
      .catch(err => {
        next(err);
      });
  }
);

router.get("/userRecipe/:id", (req, res, next) => {
  // console.log("<>><>><><><><><><>><><><><>><><><><><><><><<>");

  Recipe.findById(req.params.id)
    .then(theSinlgeRecipe => {
      // console.log(theSinlgeRecipe);

      res.render("recipe-views/recipe", { recipeDetails: theSinlgeRecipe });
    })
    .catch(err => {
      next(err);
    });
});

// router.get('/testview', (req, res, next) =>{
//   Recipe.find({_id: mongoose.Types.ObjectId('5d2ca614390d9312e14106b8')})
//   .then((testRecipe)=>{
//     // console.log("=-=-=-=-=-=-=-=-=", testRecipe[0].name)
//     res.render('recipe-views/recipe', {recipeDetails: testRecipe[0]})

//     // const recpie = new Recipe({name: doc.name, instructions: doc.analalyzed[0].steps})
//   })
//   .catch((err)=>{
//     next(err);
//   })

// });

router.post("/create", (req, res, next) => {
  console.log("------------------------------------------------", req.body);

  unirest
    .get(
      "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/extract?url=" +
        req.body.sourceURL
    )
    .header(
      "X-RapidAPI-Key",
      "e0f0a6f945mshf10650157739c5fp1b2b31jsne341caa9b0b8"
    )
    .header(
      "X-RapidAPI-Host",
      "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"
    )
    .end(function(result) {
      // console.log(result.status, result.headers, result.body);
      console.log(result.body);
      Recipe.create({
        ownerId: req.user._id,
        name: result.body.title,
        source: result.body.sourceUrl,
        image: result.body.image,
        instructions: result.body.instructions,
        detailedInstructions: result.body.analyzedInstructions[0].steps,
        ingredientsList: result.body.extendedIngredients
      })
        .then(newRecipe => {
          console.log("yay", newRecipe);
          res.redirect("/recipes/user");
        })
        .catch(err => {
          console.log("noo");
          next(err);
        });
    });
});

router.post("/delete/:id", (req, res, next) => {
  Recipe.findByIdAndRemove(req.params.id)
    .then(celebRemoved => {
      req.flash(
        "error",
        `Successfully deleted profile for ${celebRemoved.name}`
      );
      res.redirect("/celebrities");
    })
    .catch(err => {
      next(err);
    });
});

router.get("/edit/:id", (req, res, next) => {
  Recipe.findById(req.params.id)
    .then(theRecipeReturned => {
      res.render("recipe-views/edit", { theRecipe: theRecipeReturned });
    })
    .catch(err => {
      next(err);
    });
});

router.post("/add-ing-to-recipe/:id", (req, res, next) => {
  let theNewIng = req.body.newing;
  Recipe.findByIdAndUpdate(req.params.id, {
    $push: { ingredientsList: { original: theNewIng } }
  })
    .then(() => {
      res.redirect(`/recipes/edit/${req.params.id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/add-step-to-recipe/:id", (req, res, next) => {
  let theNewStep = req.body.newstep;
  Recipe.findByIdAndUpdate(req.params.id, {
    $push: { detailedInstructions: { step: theNewStep } }
  })
    .then(() => {
      res.redirect(`/recipes/edit/${req.params.id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/delete-ing/:recipeId/:ingredientIndex", (req, res, next) => {
  Recipe.findById(req.params.recipeId)
    .then(recipe => {
      recipe.ingredientsList.splice(req.params.ingredientIndex, 1);
      recipe.save().then(() => {
        res.redirect(`/recipes/edit/${req.params.recipeId}`);
      });
    })
    .catch(err => {
      next(err);
    });
});

router.post("/delete-step/:recipeId/:stepIndex", (req, res, next) => {
  Recipe.findById(req.params.recipeId)
    .then(recipe => {
      recipe.detailedInstructions.splice(req.params.stepIndex, 1);
      recipe.save().then(() => {
        res.redirect(`/recipes/edit/${req.params.recipeId}`);
      });
    })
    .catch(err => {
      next(err);
    });
});

// router.post('/celebrities/update/:id', uploadMagic.single('image'), (req, res, next) => {
//   const theID = req.params.id;

//   let name = req.body.name;
//   let occupation = req.body.occupation;
//   let catchPhrase = req.body.catchPhrase;
//   let image = ""
//   if(req.file){image = req.file.url}
//   console.log(req.file)
//   let editedCeleb = {name: name, occupation: occupation, catchPhrase: catchPhrase, image: image }
//   Celebrity.findByIdAndUpdate(theID, editedCeleb)
//   .then((newlyEditedCeleb)=>{
//     req.flash('error', (`Successfully edited profile for ${newlyEditedCeleb.name}`))
//     res.redirect(`/celebrities/details/${newlyEditedCeleb._id}`);
//   })
//   .catch((err)=>{
//     next(err);
//   })
// })

module.exports = router;
