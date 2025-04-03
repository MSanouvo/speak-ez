const { render } = require("ejs");
const { body, validationResult } = require("express-validator");
const query = require("../database/queries");
const pool = require("../database/pool");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config()

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 15 characters. (not decided yet)";

const MEMBER = process.env.MEMBER_PASSPHRASE
const ADMIN = process.env.ADMIN_PASSPHRASE


const validateUser = [
	body("first_name").trim().isAlpha().withMessage(`First name ${alphaErr}`),
	body("last_name").trim().isAlpha().withMessage(`Last name ${alphaErr}`),
	body("username")
		.trim()
		.isLength({ min: 1, max: 15 })
		.withMessage(`Username ${lengthErr}`),
	body("confirm")
		.custom((value, { req }) => {
			return value === req.body.password;
		})
		.withMessage(`Passwords did not match`),
];

const validatePassphrase = [
	body("passphrase")
		.custom((value) => {
            if(value === MEMBER || value === ADMIN){
                return value
            }
		})
        .withMessage("Passphrase is incorrect!")
];

const validateMessage = [
	body("message")
		.trim()
		.isLength({ min: 1, max: 255 })
		.withMessage("Please enter a message that is below 255 characters."),
];

passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			//maybe add a query and import this
			const { rows } = await pool.query(
				"SELECT * FROM users WHERE username = $1",
				[username]
			);
			const user = rows[0];
			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				return done(null, false, { message: "Incorrect password" });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
			id,
		]);
		const user = rows[0];

		done(null, user);
	} catch (err) {
		done(err);
	}
});

function getLogInPage(req, res) {
	res.render(
		"login",
		{
			title: "Speak-Ez",
			subTitle: "Login",
			messages: req.session.messages
		},
		req.session.messages = undefined
	);
}

function getSignUp(req, res) {
	res.render("sign-up", { title: "Speak-Ez", subTitle: "Sign Up" });
}


const postSignUp = [
	validateUser,
	async function (req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("sign-up", {
				title: "Speak-Ez",
				subTitle: "Sign-up",
				errors: errors.array(),
			});
		}
		try {
			console.log(req.body);
			const hashedPassword = await bcrypt.hash(req.body.password, 10);
			console.log(hashedPassword);
			await query.addUser(
				req.body.first_name,
				req.body.last_name,
				req.body.username,
				hashedPassword
			);
			res.redirect("/login")
		} catch (err) {
			return next(err);
		}
	},
];

const login = [
	passport.authenticate("local", {
		failureRedirect: "/login",
		failureMessage: true,
	}),
	function (req, res) {
		res.redirect("/passphrase");
	},
];

function getPassphrase(req, res) {
	console.log(req.user);
	if (req.user.ismember === true) {
		res.redirect("/");
	} else {
		res.render("passphrase", {
			title: "Speak Ez",
			subTitle: "Passphrase",
		});
	}
}

const postPassphrase = [
	validatePassphrase,
	async function (req, res, next) {
		const errors = validationResult(req);
        // console.log(req.body.passphrase)
		if (!errors.isEmpty()) {
			return res.status(400).render("passphrase", {
				title: "Speak-Ez",
				subTitle: "Passphrase",
				errors: errors.array(),
			});
		}
		try {
            if(req.body.passphrase === MEMBER){
                await query.makeMember(req.user.id);
            }
            if(req.body.passphrase === ADMIN){
                await query.makeMember(req.user.id)
                await query.makeAdmin(req.user.id)
            }
			res.redirect("/");
		} catch (error) {
			return next(error);
		}
	},
];

async function getMessages(req, res) {
	const messages = await query.getAllMessages();
	res.render("message-board", {
		title: "Speak-Ez",
		subTitle: "Messages",
		messages: messages,
		user: req.user,
	});
}

function logout(req, res) {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
}

async function deleteMessage(req, res) {
	const message = req.params;
	console.log(message);
	await query.deleteMessage(message.id);
	res.redirect("/");
}

const addPost = [
	validateMessage,
	async function (req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("add-post", {
				title: "Speak-Ez",
				subTitle: "Add Post",
				errors: errors.array(),
			});
		}
		try {
			// console.log(req.body.message);
			// console.log(req.user.username);
			await query.addMessage(req.body.message, req.user.username);
			res.redirect("/");
		} catch (error) {
			return next(error);
		}
	},
];

module.exports = {
	getLogInPage,
	getSignUp,
	passport,
	postSignUp,
	getPassphrase,
	login,
	postPassphrase,
	getMessages,
	logout,
	deleteMessage,
	addPost,
};
