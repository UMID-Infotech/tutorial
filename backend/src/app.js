//backend/src/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import superadminRoutes from "./routes/superadmin.routes.js";

const app = express();

app.use(express.json());

// CORS CONFIG
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superadminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
