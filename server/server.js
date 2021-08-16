const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const { COOKIE_EXPIRY } = require("./utils/constants");
const { json } = require("express");
const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 8080;

app.use(cookieParser());
app.use(json());
//set cookie in middleware if not
app.use(function (req, res, next) {
  if (req.cookies.userId === undefined) {
    console.log(req);
    res.cookie("userId", toString(uuidv4()), { maxAge: COOKIE_EXPIRY });
  }

  next();
});

app.get("/", (req, res) => {
  if (req.cookies.userId === undefined) {
    console.log("NOT set cook");
  }

  //else console.log(req.cookies.cookieName)
  res.send("Hello WOrs");
});

server.listen(port, () => console.log("listeining at port " + port));
module.exports = { server };
