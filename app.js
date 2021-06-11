//jshint esversion:6
require('dotenv').config;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var _ = require("lodash");
const app = express();
var encrypt = require("mongoose-encryption");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// data base schemas
const postSchema = new mongoose.Schema ({
  title: String,
  text: String
});
const Post = mongoose.model("Post", postSchema);

const userSchema = new mongoose.Schema ( {
  id : String,
  pw : String
});
const User = mongoose.model("User", userSchema);

const secret = process.env.DB_SECRET;
userSchema.plugin(encrypt, {secret:secret, encryptedFields:["pw"] });

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
  res.render("compose");
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
  const id = req.body.id;
  const pw = req.body.pw;
  
  User.find({id:id}, function(err, foundUser) {
    if (err) {
      console.log(err);
    }
    if (foundUser.pw != pw) {
      res.redirect("/authenticate");
    }
  });
  
  res.redirect("/compose");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const id = req.body.id;
  const pw = req.body.pw;
  const confirm = req.body.confirm;
  
  if (pw != confirm) {
    res.redirect("/register");
  }
  
  const newUser = new User({
    id:id, 
    pw:pw
  });
  
  newUser.save();
  
  res.redirect("/authenticate");
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







