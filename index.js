const express = require("express");

const port = 8000;

const app = express();

// database connection
const db = require("./config/db");
db();

// model connection
const UserModel = require(`./models/UserModels`);

const fs = require("fs");

app.set("view engine", "ejs");

app.use(express.urlencoded());

const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// file upload
const multer = require("multer");

const st = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqname = `${Date.now()}-${Math.random() * 100000}`;
    cb(null, `${file.fieldname}-${uniqname}`);
  },
});

const fileUpload = multer({ storage: st }).single("image");

// view users
app.get("/", (req, res) => {
  UserModel.find({})
    .then((record) => {
      console.log(`this is from view : ${record}`);
      return res.render("table", {
        record,
      });
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
});

app.get("/add", (req, res) => {
  return res.render("form");
});

// insert user
app.post("/insertRecord", fileUpload, (req, res) => {
  console.log(req.body);
  const { name, password, email, gender, hobby, city } = req.body;
  UserModel.create({
    name: name,
    password: password,
    email: email,
    image: req.file.path,
    gender: gender,
    hobby: hobby,
    city: city,
  })
    .then((data) => {
      console.log("User Inserted...");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
});

// delete user
app.get("/deleteRecord", (req, res) => {
  // console.log(`this is from delete: ${req.query}`);
  let id = req.query.did;

  // unlink file in folder
  UserModel.findById(id)
    .then((single) => {
      fs.unlinkSync(single.image);
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  UserModel.findByIdAndDelete(id)
    .then((data) => {
      console.log("record deleted");
      return res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

//edit record
app.get("/editRecord", (req, res) => {
  let id = req.query.eid;
  UserModel.findById(id)
    .then((single) => {
      console.log(single);
      return res.render("edit", { single });
    })
    .catch((err) => {
      console.log(err);
    });
});

// update record
app.post("/updateRecord", fileUpload, (req, res) => {
  console.log(req.body);
  const { name, eid, email, password, gender, hobby, city } = req.body;
  if (req.file) {
    UserModel.findById(eid)
      .then((single) => {
        if (fs.unlinkSync(single.image)) console.log("file deleted");
      })
      .catch((err) => {
        console.log(err);
        return false;
      });

    UserModel.findByIdAndUpdate(eid, {
      name: name,
      email: email,
      password: password,
      gender: gender,
      hobby: hobby,
      city: city,
      image: req.file.path,
    })
      .then((response) => {
        console.log("record updated");
        return res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  } else {
    UserModel.findById(eid)
      .then((single) => {
        UserModel.findByIdAndUpdate(eid, {
          name: name,
          email: email,
          password: password,
          gender: gender,
          hobby: hobby,
          city: city,
          image: single.image,
        })
          .then((response) => {
            console.log("record updated");
            return res.redirect("/");
            return false;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }
});

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return false;
  }
  console.log(`server is start on port :- ${port}`);
});
