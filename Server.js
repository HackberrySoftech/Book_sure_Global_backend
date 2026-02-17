import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./Middleware/errorHandler.js";

// ROUTES
import homeRoutes from "./routes/Home/HeroSectionRoutes.js";
import homeaboutRoutes from "./routes/Home/HomeAboutRoutes.js";
import HomeSoftwareRoutes from "./routes/Home/HomeSoftwareRoutes.js";
import HomeHelpRoutes from "./routes/Home/HomeHelpRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import websettingRoutes from "./routes/WebsettingRoutes.js";
import WhychosseusRoutes from "./routes/Home/WhychosseusRoutes.js";
import galleryRoutes from "./routes/Team/GalleryRoutes.js";
import TeamRoutes from "./routes/Team/TeamRoutes.js";
import PricingRoute from "./routes/PricingRoutes.js";
import InquryRoutes from "./routes/InquryRoutes.js";
import contactusroutes from "./routes/ContactusRoutes.js";
import DatasequrityRoutes from "./routes/DatasequrityRoutes.js";
import careerRoutes from "./routes/CarrerRoutes.js";
import BlogRoutes from "./routes/BlogRoutes.js";
import Aboutcontroller from "./routes/Aboutmain/AboutmainRoutes.js";
import adminRoutes from "./routes/AuthRoutes.js";
import ourassociateRoutes from "./routes/ourassociateRoutes.js";
import servicesRoutes from "./routes/Services/servicesRoutes.js";
import subServicesRoutes from "./routes/Services/subServicesRoutes.js";
import calendlyRoutes from "./routes/calendlyRoutes.js";
// DB
import "./config/db.js";

dotenv.config();

const app = express();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
/* ===== GLOBAL MIDDLEWARE ===== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);
const allowedOrigins = [process.env.ADMIN_URL, process.env.WEBSIE_URL];

app.use(cors({ origin: allowedOrigins }));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", adminRoutes);

/* ===== home ROUTES ===== */
app.use("/api", homeRoutes);
app.use("/api", homeaboutRoutes);
app.use("/api", HomeHelpRoutes);
app.use("/api", HomeSoftwareRoutes);
app.use("/api", WhychosseusRoutes);
app.use("/api", ourassociateRoutes);
// ===========Testimonials & websetting==========

app.use("/api", testimonialRoutes);
app.use("/api", websettingRoutes);
// ===========Team==========
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", galleryRoutes);
app.use("/api/team", TeamRoutes);
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

app.use("/api", servicesRoutes);
app.use("/api", subServicesRoutes);

// =================pricing model========

app.use("/api/pricing", PricingRoute);

// =======inqury==============
app.use("/api/inq", InquryRoutes);

app.use("/api/contact", contactusroutes);

app.use("/api/data", DatasequrityRoutes);

app.use("/api/blogs", BlogRoutes);
app.use("/api/aboutmain", Aboutcontroller);

app.use("/api/career", careerRoutes);

app.use("/api/calendly", calendlyRoutes);






/* ===== ERROR HANDLER (LAST) ===== */
app.use(errorHandler);










/* ===== SERVER ===== */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
