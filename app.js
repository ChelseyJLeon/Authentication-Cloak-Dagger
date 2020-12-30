//jshint esversion:6

//Requires installed applications
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Creates constant for Express application
const app = express();

//Tells app to use EJS
app.set("view engine", "ejs");

//Enables Body Parser
app.use(bodyParser.urlencoded({extended: true}));

//Allows us to use our CSS styles and other images and things
app.use(express.static("public"));

//Connects to MongoDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

//Creates new user schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//Create new user model
const User = mongoose.model("User", userSchema);

//Renders Home page
app.get("/", function(req, res){
  res.render("home");
});


app.route("/login")
//Renders Login page
.get(function(req, res){
  res.render("login");
})
//Allows user to Login
.post(function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  //Checks if the username matches a username in the system
  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        // Load hash from your password DB.
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if(result === true) {
            res.render("secrets");
          };
        });
      };
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
  //Uses bcyrpt to salt hash before storing
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //Creates new user document from user input of their registration data
    const newUser = new User ({
      email: req.body.username,
      password: hash
    });

    //Saves the document and allows user access to the Secrets page
    newUser.save(function(err){
      if(err){
        console.log(err);
      } else{
        res.render("secrets");
      };
    });
});
});


//Sets up for us to listen on port 3000 and console logs that we started this.
app.listen(3000, function() {
  console.log("Server started on Port 3000!");
})
