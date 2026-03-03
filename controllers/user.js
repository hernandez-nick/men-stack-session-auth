const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const authRequired = require("../middleware/isUserAuthorized.js");

// My profile page
router.get("/me", authRequired, async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }

    try {
        const user = await User.findById(req.session.user._id);
        res.render("profile.ejs", { user });
    } catch (error) {
        res.status(500).send("Unable to load profile");
    }
});


module.exports = router;
