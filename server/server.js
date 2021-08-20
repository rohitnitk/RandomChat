const express = require("express");
const http = require("http");
const cookie_parser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const { COOKIE_EXPIRY } = require("./utils/constants");
const { json } = require("express");
const path = require("path");
const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 8080;

app.use(cookie_parser());
app.use(json());
//set cookie in middleware if not
app.use(function (req, res, next) {
  if (req.cookies.userId === undefined) {
    res.cookie("userId", uuidv4(), { maxAge: COOKIE_EXPIRY });
    console.log(res.cookie);
  }

  next();
});

app.get("/", (req, res) => {
  if (req.cookies.userId === undefined) {
    console.log("NOT set cook");
  }

  //else console.log(req.cookies.cookieName)
  res.sendFile(path.join(__dirname, "/web/chat.html"));
});

server.listen(port, () => console.log("listeining at port " + port));
module.exports = { server };
