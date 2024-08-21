const express = require("express");
const port = 8000;
const app = express();

// connection database mongodb
const connectDB = require("./config/db");
connectDB();
app.use(express.urlencoded());

const UserModel = require(`./models/UserModels`);

app.set("view engine", "ejs");

app.get("/add", (req, res) => {
  return res.render("form");
});

app.get("/", (req, res) => {
  UserModel.find({})
    .then((record) => {
      return res.render("table", {
        record,
      });
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
});

app.post("/insertRecord", (req, res) => {
  console.log(req.body);
  const { name, password, email } = req.body;
  UserModel.create({
    name: name,
    password: password,
    email: email,
  })
    .then((data) => {
      console.log("User Insertes...");
      return res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
});

app.post("/deleteRecord", (req, res) => {
  console.log(req.body);
});

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return false;
  }
  console.log(`server is start on port :- ${port}`);
});
