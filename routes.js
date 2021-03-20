import express from "express";
import Users from "./models/Users";
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkauth = require("./middleware/check-auth");

router.get("/users", (req, res) => {
  Users.find((err, users) => {
    if (err) res.send(err);
    else res.status(200).send(users);
  });
});

router.get("/user/:id", checkauth, (req, res) => {
  Users.findById(req.params.id, (err, user) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    if (err) return res.send({ message: err });
    else return res.status(200).send({ success: "Success", user });
  });
});

router.route("/users/add").post((req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  Users.find({ email }).then((result) => {
    if (result.length === 1) {
      return res
        .status(409)
        .send({ error: "User with this email already exists" });
    } else {
      let newUser = new Users({
        username: username,
        email: email,
        password: password,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            return res.status(400).send({ error: "Bad request" });
          } else {
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                return res
                  .status(200)
                  .send({ success: "Account Created Successfully", user });
              })
              .catch((err) => {
                return res.status(400).send({ error: err });
              });
          }
        });
      });
    }
  });
});

router.post("/user/update/:id", (req, res) => {
  Users.findById(req.params.id, (err, user) => {
    if (!user) return next(new Error("Could not load Document"));
    else {
      user.username = req.body.username;
      // user.email = req.body.email;
      user
        .save()
        .then((user) => {
          res.status(200).send(user);
        })
        .catch((err) => {
          res.status(400).send({ message: "Update failed" });
        });
    }
  });
});

router.get("/users/delete/:id", (req, res) => {
  Users.findOneAndDelete({ _id: req.params.id }, (err, user) => {
    if (err) res.json(err);
    else res.send("User Deleted");
  });
});

router.post("/auth/login", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Users.find({ email: email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(400).send({
          error: "Invalid email or password",
          message: "Invalid email or password",
        });
      }
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (err) {
          return res.status(400).send({
            error: "Invalid email or password",
            message: "Invalid email or password",
          });
        }
        if (result) {
          const userDetail = {
            id: user[0]._id,
            userId: user[0]._id,
            username: user[0].username,
            email: user[0].email,
            role: user[0].role,
            createdDate: user[0].date,
          };
          const token = jwt.sign(
            {
              id: user[0]._id,
              email: user[0].email,
              userId: user[0]._id,
              role: user[0].role,
              createdDate: user[0].date,
            },
            "secret",
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            message: "Auth Successful",
            token: token,
            user: userDetail,
          });
        }
        return res.status(400).send({
          error: "Invalid email or password",
          message: "Invalid email or password",
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.put("/profile/:id", (req, res) => {
  Users.findById(req.params.id, (err, profile) => {
    if (!profile) return res.json({ message: err });
    else {
      profile.firstname = req.body.firstname;
      profile.lastname = req.body.lastname;
      profile.phone = req.body.phone;
      profile
        .save()
        .then((profile) => {
          return res
            .status(200)
            .send({ success: "Profile Created Successfully", profile });
        })
        .catch((err) => {
          res.status(400).send({ message: err });
        });
    }
  });
});

router.put("/about/:id", (req, res) => {
  Users.findById(req.params.id, (err, user) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    if (!user) res.status(400).send({ message: err });
    else {
      user.about = req.body.about;
      user
        .save()
        .then((user) => {
          return res
            .status(200)
            .send({ success: "About Created Successfully", user });
        })
        .catch((err) => {
          res.status(400).send({ message: err });
        });
    }
  });
});

router.put("/skills/:id", (req, res) => {
  Users.findById(req.params.id, (err, user) => {
    if (!user) return res.status(400).send({ message: err });
    else {
      user.skills = req.body.skills;

      user
        .save()
        .then((user) => {
          return res
            .status(200)
            .send({ success: "Skills Created Successfully", user });
        })
        .catch((err) => {
          res.status(400).send({ message: err });
        });
    }
  });
});

export default router;
