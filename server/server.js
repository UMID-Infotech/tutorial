//server/server.js
import express from "express";
import { config } from "dotenv";
import { dbConnect } from "./configs/dbConnect.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";
import studentRoutes from "./routes/student.routes.js";
import classRoutes from "./routes/class.routes.js";
import meetRoutes from "./routes/meet.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";

config();
dbConnect();
import "./services/reminderJob.js";
import "./services/classCompletionJob.js";

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize app FIRST
const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS (UPDATED ✅)
app.use(
  cors({
    origin: "https://tution-topaz.vercel.app", // your Vercel frontend
    credentials: true,
  }),
);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tution-topaz.vercel.app",
      "https://tution-tawny-three.vercel.app",
    ],
    credentials: true
  })
);

// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/class", classRoutes);
app.use("/api/meet", meetRoutes);
app.use("/api/attendance", attendanceRoutes);

// ❌ REMOVE THIS IF USING VERCEL FRONTEND
// (Not needed anymore because frontend is separate)
app.use(express.static(path.join(__dirname, "../dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ✅ Port
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
