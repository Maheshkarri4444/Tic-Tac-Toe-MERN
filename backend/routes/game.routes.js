import express from "express";
import { login , create , join, playX, playO, resetGame , getGame} from "../controllers/game.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/login",login);
router.post("/create",protectRoute,create);
router.post("/join",protectRoute,join);

router.get("/play/:roomId",getGame);
router.post("/play/:roomId/X/:xpos",protectRoute,playX);
router.post("/play/:roomId/O/:opos",protectRoute,playO);
router.put("/play/reset/:roomId",protectRoute,resetGame);


export default router;