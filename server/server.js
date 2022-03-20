const express = require("express");
const http = require("http");
const cookie_parser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const { COOKIE_EXPIRY } = require("./utils/constants");
const path = require("path");
const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: false }));
app.use(cookie_parser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//set cookie in middleware if not
app.use(function (req, res, next) {
  if (req.cookies.userId === undefined) {
    res.cookie("userId", uuidv4(), { maxAge: COOKIE_EXPIRY });
  }

  next();
});

app.post("/", (req, res) => {
  res.cookie("name", req.body.name, { maxAge: COOKIE_EXPIRY });
  res.sendFile(path.join(__dirname, "/views/chat.html"));
});

app.get("/", (req, res) => {
  if (req.cookies.userId === undefined) {
    console.log("Cookie NOT set!");
  }

  //else console.log(req.cookies.cookieName)
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

server.listen(port, () => console.log("listeining at port " + port));
module.exports = { server };
