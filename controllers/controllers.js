const { render } = require("ejs");
const { body, validationResult } = require("express-validator");
const query = require("../database/queries");
const pool = require("../database/pool");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 15 characters. (not decided yet)";

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
		.custom((value, { req }) => {
			return value === "secret";
		})
		.withMessage("Wrong passphrase !"),
];

const validateMessage = [
    body("message").trim()
        .isLength({ min: 1, max: 255 })
        .withMessage("Please enter a message that is below 255 characters.")
]

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

function getSlashPage(req, res) {
	res.render(
		"index",
		{
			title: "Speak-Ez",
			subTitle: "Log In",
			messages: req.session.messages,
		},
		(req.session.messages = undefined)
	);
}

function getSignUp(req, res) {
	res.render("sign-up", { title: "Speak-Ez", subTitle: "Sign Up" });
}

// async function postSignUp(req, res, next) {
//     try{
//         console.log(req.body)
//         const hashedPassword = await bcrypt.hash(req.body.password, 10)
//         await query.addUser(req.body.first_name, req.body.last_name, req.body.username, hashedPassword)
//         if(req.body.admin === 'on'){
//             const user = await query.getLatestUser()
//             console.log(user)
//             await query.makeAdmin(user.id)
//         }
//         res.redirect("/passphrase")
//     } catch(err) {
//         return next(err)
//     }
// }

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
			if (req.body.admin === "on") {
				const user = await query.getLatestUser();
				console.log(user);
				await query.makeAdmin(user.id);
			}
			// res.redirect("/passphrase")
			res.redirect("/");
		} catch (err) {
			return next(err);
		}
	},
];

const login = [
	passport.authenticate("local", {
		failureRedirect: "/",
		failureMessage: true,
	}),
	function (req, res) {
		res.redirect("/passphrase");
	},
];

function getPassphrase(req, res) {
	//check for user, if user is already memeber, redirect to message board
	//if user is not a member, render passphrase page to enter password
	//add option to skip passphrase and go to message board as non member
	console.log(req.user);
	if (req.user.ismember === true) {
		res.redirect("/messages");
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
		if (!errors.isEmpty()) {
			return res.status(400).render("passphrase", {
				title: "Speak-Ez",
				subTitle: "Passphrase",
				errors: errors.array(),
			});
		}
		try {
			console.log(req.user.id);
			await query.makeMember(req.user.id);
			res.redirect("/messages");
		} catch (error) {
			return next(error);
		}
	},
];

async function getMessages(req, res) {
	if (req.user) {
		const messages = await query.getAllMessages();
		res.render("message-board", {
			title: "Speak-Ez",
			subTitle: "Messages",
			messages: messages,
			user: req.user,
		});
	} else {
        res.redirect("/")
    }
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
	await query.deleteMessage(message.id)
	res.redirect("/messages")
}

function addPostGet(req, res) {
    res.render("add-post", {
        title: "Speak-Ez",
        subTitle: "Add Post"
    })
}

const addPost = [
    validateMessage,
    async function(req, res, next) {
        const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("add-post", {
				title: "Speak-Ez",
				subTitle: "Add Post",
				errors: errors.array(),
			});
		}
		try {
            console.log(req.body.message)
            console.log(req.user.username)
            await query.addMessage(req.body.message, req.user.username)
			res.redirect("/messages");
		} catch (error) {
			return next(error);
		}
    }
]

module.exports = {
	getSlashPage,
	getSignUp,
	passport,
	postSignUp,
	getPassphrase,
	login,
	postPassphrase,
	getMessages,
	logout,
	deleteMessage,
    addPostGet,
    addPost
};
