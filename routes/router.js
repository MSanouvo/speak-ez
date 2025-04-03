const { Router } = require("express")
const controller = require("../controllers/controllers")

const router = Router()

router.get("/", controller.getMessages)
router.get("/login", controller.getLogInPage)
router.post("/login", controller.login)
router.get("/sign-up", controller.getSignUp)
router.post("/sign-up", controller.postSignUp)
router.get("/passphrase", controller.getPassphrase)
router.post("/passphrase", controller.postPassphrase)
router.get("/logout", controller.logout)
router.post("/delete/:id", controller.deleteMessage)
router.post("/add", controller.addPost)

module.exports = router