import { Router } from "express";
import authRoutes from "./auth.routes";
import groupRoutes from "./group.routes";
import awsRoutes from "./aws.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/groups", groupRoutes);
router.use("/aws", awsRoutes)

export default router;
