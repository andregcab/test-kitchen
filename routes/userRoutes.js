const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const bcrypt  = require('bcryptjs');
const passport = require('passport');
const ensureLogin = require("connect-ensure-login");




router.get('/signup', (req, res, next)=>{
    res.render('user-views/signup');
})

router.post('/signup', (req, res, next)=>{
  const theUsername = req.body.username;
  const thePassword = req.body.password;
  const salt = bcrypt.genSaltSync(12);
  const hashedPassWord =  bcrypt.hashSync(thePassword, salt);

  if(thePassword && theUsername){
    User.create({
      username: theUsername,
      password: hashedPassWord
    })
  .then((newUser)=>{
    req.session.currentUser = newUser;
    console.log('yay');
    console.log(newUser)
    req.login(newUser, (err) => {
      if(err) {
        next(err);
      } else {
        newUser.set({loggedIn: true});
      }
   })
    res.redirect('/recipes/user')
  })
  .catch((err)=>{
    next(err);
  })
  } else {
    req.flash('error', 'Please provide all information!')
    res.redirect('/signup');
  }   
})



router.get('/login', (req, res, next)=>{
  if(req.user){
    res.redirect("/recipes/user");
    // early return to stop the function since there's an error
    //(prevents the rest of the code form running
    return;
  }
  res.render('user-views/login') //{error: req.session.errorMessage}
})

router.post("/login", passport.authenticate("local", {
  successRedirect: "/recipes/user",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));


router.get("/homepage", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("user-views/homepage", { user: req.user });
});


router.post("/logout", (req, res, next)=>{
  // req.session.destroy()
  req.logout();
  req.flash('error', 'Sucessfully logged out')
  res.redirect('/')
  console.log('logged out')
})




module.exports = router;