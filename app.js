//jshint esversion:6
require('dotenv').config;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var _ = require("lodash");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "YouWillNeverWalkAlone",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);



// data base schemas
const postSchema = new mongoose.Schema ({
  title: String,
  text: String
});
const Post = mongoose.model("Post", postSchema);

const userSchema = new mongoose.Schema ( {
  username : String,
  password : String
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// base interfaces

app.get("/", function(req,res) {
  Post.find({}, function(err, foundPosts) {
      res.render("home", {posts:foundPosts});
  }); 
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

app.get("/about", function(req, res) {
  res.render("about");
});



// compose

app.get("/compose", function(req, res) {
  if (req.isAuthenticated()){
    res.render("compose");
  } else {
    res.redirect("/authenticate");
  }
});


app.post("/compose", function(req, res) {
  const new_post = new Post({
    title: req.body.postTitle,
    text: req.body.postText
  });
  
  new_post.save();

  res.redirect("/");
});


// authentication semantics

app.get("/authenticate", function(req, res) {
  res.render("authenticate");
})

app.post("/authenticate", function(req, res) {
  // const id = req.body.id;
  // const pw = req.body.pw;
  
  // User.find({id:id}, function(err, foundUser) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   bcrypt.compare(pw, foundUser[0].pw, function(err, result) {
  //     if(result == true){
  //       res.redirect("/compose");
  //     } else {
  //       res.redirect("/authenticate");
  //     }
  //   });
  // });
  const newUser = new User( {
    username: req.body.id,
    password: req.body.password
  });
  
  req.login(newUser, function(err) {
    if (err) {
      console.log(err);
      res.redirect("/authenticate");
    } else {
      passport.authenticate("local");
      res.redirect("/compose");
    }
  })
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  // A lower level way of login semantics
  // const id = req.body.id;
  // const pw = req.body.pw;
  // const confirm = req.body.confirm;
  
  // if (pw != confirm) {
  //   res.redirect("/register");
  // }
  
  // bcrypt.hash(pw, saltRounds, function(err, hash) {
  //   const newUser = new User({
  //     id: id,
  //     pw: hash
  //   });
    
  //   newUser.save(function(err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.redirect("/authenticate");
  //     }
  //   });
  // });
  
  if (req.body.pw != req.body.confirm){
    res.redirect("/register");
  } else {
    User.register({username:req.body.id}, req.body.pw, function(err, user) {
      if (err){
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local");
        res.redirect("/compose");
      }
    });
  }
});

// Dynamic Post viewer.

app.get("/posts/:topic", function(req, res) {
  Post.find({}, function(err, PostsFound) {
    PostsFound.forEach(function(post) {
      if(_.camelCase(post.title) == _.camelCase(req.params.topic))
        res.render("post", {postTitle:post.title, postText:post.text});
    });
  });
});


// set Port
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

