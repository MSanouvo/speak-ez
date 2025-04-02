const express = require("express")
const path = require("node:path")
//Name can change if needed
const index = require("./routes/index")

const app = express()
const PORT = process.eventNames.PORT || 3000

app.use(express.urlencoded({ exntended: true }))
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

//For CSS
const assetsPath = path.join(__dirname, "styles")
app.use(express.static(assetsPath))

app.use("/", index)


app.listen(PORT, () => {
    console.log(`Server Running at port: ${PORT}`)
})