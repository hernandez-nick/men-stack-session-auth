const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs", { message: null });
});

router.post("/sign-up", async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;

        // Usernames need to be unique: two people can't share the same username!
        const foundUser = await User.findOne({ username });
        if (foundUser) {
            // If the username is already taken, we can send an error message back to the client.
            throw new Error(`Username already exists. Please choose a different ${username}.`);
        }
        // The password and confirmPassword fields must match to verify there were no typos.
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match. Please try again.");
        }
        // Passwords cannot be stored directly as plain-text in the database, this is not secure.
        
        const hashedPassword = bcrypt.hashSync(password, 8);
        const user = await User.create({
            username,
            hashedPassword
    })
    res.status(200).json(user)
    } catch (error) {
        res.render("auth/sign-up.ejs", { message: error.message });
    }
    });


router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs");
});


router.post("/sign-in", async (req, res) => {
    const { username, password } = req.body;
    try {
        const foundUser = await User.findOne({ username });
        if (!foundUser) {
            throw new Error(
            `User with the username ${username} does not exist. Please sign up first.`,
            );
        }
        const isValidPassword = bcrypt.compareSync(
            password,
            foundUser.hashedPassword,
        );
        if (!isValidPassword) {
            throw new Error("Invalid username or password. Please try again.");
        }

        // Handle actually signing in the user
        // add the users name and id onto the session
        req.session.user = {
            _id: foundUser._id,
            username: foundUser.username,
        };

        // save the session to mongodb
        req.session.save(() => {
            res.redirect("/");
        });


    } catch (error) {
        res.render("auth/sign-in.ejs", { message: error.message });
    }
});


router.get("/sign-out", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
