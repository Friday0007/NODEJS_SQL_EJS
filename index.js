const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));

const port = 8080;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "sample",
  password: "vaibhav123",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

app.get("/", (req, res) => {
  let userQuery = `SELECT COUNT(*) FROM user`;
  try {
    connection.query(userQuery, (err, result) => {
      if (err) throw err;
      let count = result[0]["COUNT(*)"];
      res.render("home.ejs", {count});
    });
  } catch (error) {
    console.log(error);
    res.send("Error in Database");
  };
});

app.get("/user", (req, res) => {
  let userQuery = `SELECT * FROM user`;
  try {
    connection.query(userQuery, (err, result) => {
      if(err) throw err;
      let data = result;
      console.log(data);
      res.render("users.ejs", {data});
    });
  } catch (error) {
    res.send("Error Occured in DB");
  };
});

// Edit Route
app.get("/user/:id/edit", (req, res) => {
  let  {id} = req.params;
  let userQuery = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(userQuery, (err, result) => {
      if(err) throw err;
      console.log(result);

      let user  = result[0];
      res.render("edit.ejs", {user});
    });
  } catch (error) {
    res.send("Error Occured in DB");
  };
});

// Update Route
app.patch("/user/:id" , (req, res) => {
  let  {id} = req.params;
  let {password: formPass, username: newUsername} = req.body;
  let userQuery = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(userQuery, (err, result) => {
      if(err) throw err;
      let user  = result[0];
      if(formPass != user.password) {
        res.send("Wrong Password");
      }
      else {
        let query2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;
        connection.query(query2, (err, result) => {
          if(err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (error) {
    res.send("Error Occured in DB");
  };
});

// New User to database
app.get("/user/new", (req, res) => {
  res.render("addUser.ejs");
});

app.post("/user/new",(req, res) => {
  let {username, email, password} = req.body;
  let id = uuidv4();
  // New Query
  let userQuery = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}')`;

  try {
    connection.query(userQuery, (err, result) => {
      if(err) throw err;
      console.log("Added New User");
      res.redirect("/user");
    });
  } catch (error) {
    res.send("Error in DB");
  }

});

// Delete User from DB
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(port, () => {
  console.log(`App is listening at port ${port}`);
});

// try {
//   connection.query(query, [data], (err, result) => {
//     if (err) throw err;
//     console.log(result);
//   });
// } catch (error) {
//   console.log(error);
// }

// connection.end();
