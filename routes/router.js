const { Router } = require("express")
const controller = require("../controllers/controllers")

const router = Router()

router.get("/", controller.getSlashPage)
router.get("/sign-up", controller.getSignUp)

module.exports = router