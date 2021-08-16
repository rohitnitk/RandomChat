const express = require("express");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const { COOKIE_EXPIRY } = require("./utils/constants");
const app = express();

app.use(cookieParser());

//set cookie in middleware if not
app.use(function (req, res, next) {
  if (req.cookies.userId === undefined) {
    console.log(req);
    res.cookie("userId", uuidv4(), { maxAge: COOKIE_EXPIRY });
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

app.listen(8080, () => console.log("listeining at 8080..."));
