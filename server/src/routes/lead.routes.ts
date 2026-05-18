import { Router } from "express";
import * as leadController from "../controllers/lead.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/stats", leadController.getLeadStats);
router.get("/", leadController.getLeads);
router.post("/", leadController.createLead);
router.put("/:id", leadController.updateLead);
router.delete("/:id", leadController.deleteLead);

export default router;
