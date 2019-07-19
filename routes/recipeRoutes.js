const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const mongoose = require("mongoose");
const ensureLogin = require("connect-ensure-login");
const multer = require("../components/multer/multer");
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
  Recipe.create({})
    // .save()
    .then(recipe => {
      res.render("recipe-views/edit", { theRecipe: recipe }); //the view file to enter the info
    });
});

// router.post(
//   "/create-new-recipe",
//   // uploadMagic.single("image"),
//   (req, res, next) => {
//     //takes all the new recipe information to upload to database
//     console.log(req.body);
//     let ownerId = req.user._id;
//     let name = req.body.name;
//     let source = req.body.source;
//     let tags = req.body.tags;
//     let notes = req.body.notes;
//     let instructions = req.body.instructions;
//     let detailedInstructions = req.body.detailedInstructions;
//     let ingredientsList = req.body.ingredientsList;
//     let rating = req.body.rating;
//     let snippet = req.body.snippet;
//     // let image = req.file.url || '';

//     let newRecipe = {
//       ownerId: ownerId,
//       name: name,
//       source: source,
//       tags: tags,
//       /*image: image,*/ notes: notes,
//       instructions: instructions,
//       detailedInstructions: detailedInstructions,
//       ingredientsList: ingredientsList,
//       snippet: snippet,
//       rating: rating
//     };
//     console.log(newRecipe);
//     Recipe.create(newRecipe)
//       .then(newlyCreatedRecipe => {
//         req.flash("error", `Successfully added ${newlyCreatedRecipe.name}`);
//         // console.log(newlyCreatedRecipe._id)
//         res.redirect(`/recipes/userRecipe/${newlyCreatedRecipe._id}`);
//       })
//       .catch(err => {
//         next(err);
//       });
//   }
// );

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

router.post("/create", (req, res, next) => {
  unirest
    .get(
      "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/extract?url=" +
        req.body.sourceURL
    )
    .header("X-RapidAPI-Key", process.env.APIKEY)
    .header("X-RapidAPI-Host", process.env.APIHOST)
    .end(function(result) {
      // console.log(result.status, result.headers, result.body);
      const data = {
        ownerId: req.user._id,
        name: result.body.title,
        source: result.body.sourceUrl,
        image: result.body.image,
        instructions: result.body.instructions,
        ingredientsList: result.body.extendedIngredients
      };
      if (result.body.analyzedInstructions.length >= 1) {
        data.detailedInstructions = result.body.analyzedInstructions[0].steps;
      }
      Recipe.create(data)
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

router.post("/add-note/:id", (req, res, next) => {
  let theNewNote = req.body.notes;
  Recipe.findByIdAndUpdate(req.params.id, {
    $push: { notes: theNewNote }
  })
    .then(recipe => {
      console.log(recipe);
      res.redirect(`/recipes/edit/${req.params.id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/delete-note/:recipeId/:noteIndex", (req, res, next) => {
  Recipe.findById(req.params.recipeId)
    .then(recipe => {
      recipe.notes.splice(req.params.noteIndex, 1);
      recipe.save().then(() => {
        res.redirect(`/recipes/edit/${req.params.recipeId}`);
      });
    })
    .catch(err => {
      next(err);
    });
});

router.post("/add-tag/:id", (req, res, next) => {
  console.log(req.body.tags);
  let theNewTag = req.body.tags;
  Recipe.findByIdAndUpdate(req.params.id, {
    $push: { tags: theNewTag }
  })
    .then(recipe => {
      console.log(recipe);
      res.redirect(`/recipes/edit/${req.params.id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/delete-tag/:recipeId/:noteIndex", (req, res, next) => {
  Recipe.findById(req.params.recipeId)
    .then(recipe => {
      recipe.tags.splice(req.params.noteIndex, 1);
      recipe.save().then(() => {
        res.redirect(`/recipes/edit/${req.params.recipeId}`);
      });
    })
    .catch(err => {
      next(err);
    });
});

router.post("/add-image/:id", multer.single("image"), (req, res, next) => {
  let theNewImage = req.file.url;
  console.log(theNewImage);
  Recipe.findByIdAndUpdate(req.params.id, {
    image: theNewImage
  })
    .then(recipe => {
      console.log(recipe);
      res.redirect(`/recipes/edit/${req.params.id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/blah", (req, res, render) => {
  console.log(req.body);
});

router.post("/update/:id", (req, res, next) => {
  // console.log(req.body);8
  let data = {
    name: req.body.name,
    snippet: req.body.snippet
  };
  if (req.body[`ingredient_0`]) {
    data.ingredientsList = [];
  }
  for (let i = 0; i < 30; i++) {
    if (req.body[`ingredient_${i}`]) {
      data.ingredientsList.push({ original: req.body[`ingredient_${i}`] });
    }
  }
  if (req.body[`instructions_0`]) {
    data.detailedInstructions = [];
  }
  for (let i = 0; i < 30; i++) {
    if (req.body[`instructions_${i}`]) {
      data.detailedInstructions.push({
        step: req.body[`instructions_${i}`]
      });
    }
  }
  // console.log(data);

  Recipe.findByIdAndUpdate(req.params.id, data)
    .then(() => {
      res.redirect(`/recipes/userRecipe/${req.params.id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/delete/:id", (req, res, next) => {
  Recipe.findByIdAndRemove(req.params.id)
    .then(() => {
      res.redirect("/recipes/user");
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
