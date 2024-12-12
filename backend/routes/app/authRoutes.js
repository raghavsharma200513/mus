const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Appauth");
const isAuth = require("../../middlewares/is-auth");
const AuthController = require("../../controllers/app/authController");

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/profile-update", isAuth, AuthController.profile_update);
router.get("/get_user_profile", isAuth, AuthController.get_user_profile);
// router.post("/forgot", AuthController.forgot_password);

module.exports = router;
