const express = require("express")
const path = require("node:path")
const session = require("express-session")
const controller = require("./controllers/controllers")

const index = require("./routes/router")

const app = express()
const PORT = process.eventNames.PORT || 3000

app.use(express.urlencoded({ exntended: true }))
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

//might need to move these to controller
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }))
app.use(controller.passport.session())
app.use(express.urlencoded({ extended: false }))

// app.use((req, res, next) => {
//     console.log(req.session)
//     console.log(req.user)
//     next()
// })

//For CSS
const assetsPath = path.join(__dirname, "styles")
app.use(express.static(assetsPath))

app.use("/", index)


app.listen(PORT, () => {
    console.log(`Server Running at port: ${PORT}`)
})