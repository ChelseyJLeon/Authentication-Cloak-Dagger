//jshint esversion:6

//Requires installed applications
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


//Creates constant for Express application
const app = express();

//Tells app to use EJS
app.set("view engine", "ejs");

//Enables Body Parser
app.use(bodyParser.urlencoded({extended: true}));

//Allows us to use our CSS styles and other images and things
app.use(express.static("public"));

//Allows us to enable sessions
app.use(session({
  secret: "This will be our little secret that's just between us friends.",
  resave: false,
  saveUninitialized: false
}));

//Initializes Passport
app.use(passport.initialize());

//Tells Passport to initialize sessions and to deal with them
app.use(passport.session());

//Connects to MongoDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

//Prevents deprecation warning about collection.ensureIndex
mongoose.set("useCreateIndex", true);

//Creates new user schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//initialize Passport Local mongoose
userSchema.plugin(passportLocalMongoose);

//Create new user model
const User = mongoose.model("User", userSchema);

//Tells Passport to serialize and deserialize the code
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Renders Home page
app.get("/", function(req, res){
  res.render("home");
});

//Creates Secrets route for us to access once the user is authenticated.
app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.route("/login")
//Renders Login page
.get(function(req, res){
  res.render("login");
})
//Allows user to Login
.post(function(req, res){
  //Create new user from userSchema
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  //Use Passport to authenticate user
  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    };
  });

});


app.route("/register")
//Renders Register page
.get(function(req, res){
  res.render("register");
})
//Updates database with registered user
.post(function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err){
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    };
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


//Sets up for us to listen on port 3000 and console logs that we started this.
app.listen(3000, function() {
  console.log("Server started on Port 3000!");
})
