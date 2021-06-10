//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology: true});

const postSchema = new mongoose.Schema ({
  title: String,
  text: String
});

const Post = mongoose.model("Post", postSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req,res) {
  Post.find({}, function(err, foundPosts) {
      res.render("home", {posts:foundPosts})
  }); 
});

app.get("/contact", function(req, res) {
  res.render("contact", {contactContent: contactContent});
});

app.get("/about", function(req, res) {
  res.render("about", {aboutContent: aboutContent});
});

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

app.get("/posts/:topic", function(req, res) {
  Post.find({}, function(err, PostsFound) {
    PostsFound.forEach(function(post) {
      if(_.camelCase(post.title) == _.camelCase(req.params.topic))
        res.render("post", {postTitle:post.title, postText:post.text});
    });
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});