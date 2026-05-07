import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contradictionsRouter from "./contradictions";
import topicsRouter from "./topics";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contradictions", contradictionsRouter);
router.use("/topics", topicsRouter);
router.use("/stats", statsRouter);

export default router;
