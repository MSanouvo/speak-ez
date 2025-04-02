const { render } = require("ejs")
const { body, validationResult } = require("express-validator");
const query = require("../database/queries")

function getSlashPage(req, res) {
    res.render("index", { title: "Speak-Ez", subTitle: "Log In" })
}

function getSignUp(req, res) {
    res.render("sign-up", { title: "Speak-Ez", subTitle: "Sign Up" })
}

module.exports = {
    getSlashPage,
    getSignUp
}