const { Router } = require("express")
const controller = require("../controllers/controllers")

const router = Router()

router.get("/", controller.getSlashPage)
router.post("/log-in", controller.login)
router.get("/sign-up", controller.getSignUp)
router.post("/sign-up", controller.postSignUp)
router.get("/passphrase", controller.getPassphrase)
router.post("/passphrase", controller.postPassphrase)
router.get("/messages", controller.getMessages)
router.get("/logout", controller.logout)
router.post("/delete/:id", controller.deleteMessage)

module.exports = router