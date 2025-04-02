const { Router } = require("express")
const controller = require("../controllers/controllers")

const router = Router()

router.get("/", controller.getSlashPage)
router.post("/log-in", controller.login)
router.get("/sign-up", controller.getSignUp)
router.post("/sign-up", controller.postSignUp)
router.get("/passphrase", controller.getPassphrase)

module.exports = router