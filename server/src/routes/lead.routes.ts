import { Router } from "express";
import * as leadController from "../controllers/lead.controller";
import { requireAuth as authMiddleware } from "../middleware/auth.middleware";
import { authorizeRoles as roleMiddleware } from "../middleware/role.middleware";

const router = Router();

const adminAndSales = roleMiddleware("admin", "sales");
const adminOnly = roleMiddleware("admin");

router.get("/", authMiddleware, adminAndSales, leadController.getAllLeads);
router.post("/", authMiddleware, adminAndSales, leadController.createLead);
router.get(
  "/export",
  authMiddleware,
  adminOnly,
  leadController.exportLeads,
);
router.get("/:id", authMiddleware, adminAndSales, leadController.getLeadById);
router.put("/:id", authMiddleware, adminAndSales, leadController.updateLead);
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  leadController.deleteLead,
);

export default router;
