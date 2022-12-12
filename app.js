//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { hash, compare } = require("bcrypt");
const session = require("express-session");
const cookie = require("cookie-parser");

const Post = require("./models/Post");
const User = require("./models/User");

const homeStartingContent =
  "Hi There! Welcome to Study Companion! Study Companion is a web application made to help you create your school notes. Our note taking system is adapting the Cornell Method that is well known for its efficiency.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");
app.use(cookie());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "super secret key",
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    resave: false,
    saveUninitialized: false,
  })
);

mongoose.connect(
  "mongodb+srv://hendro123:hendro123@cluster0.00vqhfa.mongodb.net/blogdatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function () {
  console.log("mongodb connected succesfully");
});

app.get("/", function (req, res) {
  Post.find({}, function (err, posts) {
    console.log(req.session);
    if (!req.session.user) return res.redirect("/login");
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts,
      user: req.session.user,
    });
  });
});

app.get("/register", function (req, res) {
  res.render("register", {
    user: req.session.user,
  });
});

app.get("/logout", function (req, res) {
  res.render("logout", {
    user: req.session.user,
  });
});

app.post("logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

app.post("/register", async function (req, res) {
  const { username, password } = req.body;
  const hashed_password = await hash(password, 12);
  const user = new User({
    username,
    password: hashed_password,
  });
  User.create(user, function (err, user) {
    console.log(user);
  });
  res.redirect("/login");
});

app.get("/login", function (req, res) {
  res.render("login", {
    user: req.session.user,
  });
});

app.post("/login", async function (req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.find({ username });
    if (user.length === 0) {
      return res.render("login", {
        user: req.session.user,
      });
    }
    if (await compare(password, user[0].password)) {
      req.session.user = user[0];
      return res.redirect("/");
    }
  } catch {}
});

app.get("/compose", function (req, res) {
  res.render("compose", {
    user: req.session.user,
  });
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    subject: req.body.postSubject,
    question: req.body.postQuestion,
    content: req.body.postBody,
    summary: req.body.postSummary,
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      subject: post.subject,
      question: post.question,
      content: post.content,
      summary: post.summary,
    });
  });
});

app.get("/delete", function (req, res) {
  res.render("delete", {
    user: req.session.user,
  });
});

app.post("/delete", function (req, res) {
  const deleteId = req.body.deletePost;

  Post.findByIdAndRemove(deleteId, function (err) {
    if (!err) {
      console.log("delete item");
      res.redirect("/");
    } else {
      console.log("error");
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent, user: req.session.user });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    contactContent: contactContent,
    user: req.session.user,
  });
});

app.get("/pomodoro", function (req, res) {
  res.render("pomodoro", {
    user: req.session.user,
  });
});

app.get("/examprep", function (req, res) {
  res.render("examprep", {
    user: req.session.user,
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
