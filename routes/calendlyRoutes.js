import express from "express";
import {
  syncCalendlyEvents,
  getCalendlyEvents,getTodayActiveMeetings
} from "../controllers/calendlyController.js";

const router = express.Router();

router.get("/sync", syncCalendlyEvents);
router.get("/events", getCalendlyEvents);
router.get("/today-active", getTodayActiveMeetings);
export default router;