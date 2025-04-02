const { render } = require("ejs")
const { body, validationResult } = require("express-validator");
const query = require("../database/queries")
const pool = require("../database/pool")
const bcrypt = require("bcryptjs");
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy

const alphaErr = "must only contain letters."
const lengthErr = "must be between 1 and 15 characters. (not decided yet)"

const validateUser = [
    body("first_name").trim()
        .isAlpha().withMessage(`First name ${alphaErr}`),
    body("last_name").trim()
        .isAlpha().withMessage(`Last name ${alphaErr}`),
    body("username").trim()
        .isLength({ min: 1, max: 15 }).withMessage(`Username ${lengthErr}`),
    body("confirm")
        .custom((value, { req }) => {
            return value === req.body.password
        }).withMessage(`Passwords did not match`)
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
            const match = await bcrypt.compare(password, user.password)
			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			}
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
    res.render("index", { title: "Speak-Ez", subTitle: "Log In" })
}

function getSignUp(req, res) {
    res.render("sign-up", { title: "Speak-Ez", subTitle: "Sign Up" })
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
        if(!errors.isEmpty()) {
            return res.status(400).render("sign-up", {
                title: "Speak-Ez",
                subTitle: "Sign-up",
                errors: errors.array(),
            })
        }
        try{
            console.log(req.body)
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            console.log(hashedPassword)
            await query.addUser(req.body.first_name, req.body.last_name, req.body.username, hashedPassword)
            if(req.body.admin === 'on'){
                const user = await query.getLatestUser()
                console.log(user)
                await query.makeAdmin(user.id)
            }
            // res.redirect("/passphrase")
            res.redirect("/")
        } catch(err) {
            return next(err)
        }
    }
]

const login = passport.authenticate("local", {
        successRedirect: "/passphrase",
        failureRedirect: "/"
    })

function getPassphrase(req, res){
    //check for user, if user is already memeber, redirect to message board
    //if user is not a member, render passphrase page to enter password
        //add option to skip passphrase and go to message board as non member
    console.log(req.user)
    res.render("passphrase", {
        title: "Speak Ez",
        subTitle: "Passphrase"
    })
}
module.exports = {
    getSlashPage,
    getSignUp,
    passport,
    postSignUp,
    getPassphrase,
    login
}