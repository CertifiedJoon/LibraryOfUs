//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const app = express();

let posts = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req,res) {
  res.render("home", {posts: posts});
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
  const post = {
    title: req.body.postTitle,
    text: req.body.postText
  };
  
  posts.push(post);
  res.redirect("/");
});

app.get("/posts/:topic", function(req, res) {
  for (var i = 0; i < posts.length; ++i) {
    if (_.camelCase(posts[i].title) == _.camelCase(req.params.topic))
      res.render("post", {postTitle:posts[i].title, postText:posts[i].text});
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});