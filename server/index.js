import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(express.json({ limit: "20kb" }));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://sudhir848.github.io",
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    console.error(`CORS blocked for origin: ${origin}`);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const resend = new Resend(process.env.RESEND_API_KEY);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: "Too many contact attempts. Please try again later.",
  },
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body ?? {};

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanMessage = String(message || "").trim();

    if (cleanName.length > 100) {
      return res.status(400).json({ ok: false, error: "Name is too long." });
    }

    if (cleanEmail.length > 254) {
      return res.status(400).json({ ok: false, error: "Email is too long." });
    }

    if (cleanMessage.length > 3000) {
      return res.status(400).json({ ok: false, error: "Message is too long." });
    }
    
    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({ ok: false, error: "Missing fields." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Missing required email environment variable.");
      return res.status(500).json({
        ok: false,
        error: "Contact service is temporarily unavailable.",
      });
    }
    if (!process.env.TO_EMAIL) {
      console.error("Missing required email environment variable.");
      return res.status(500).json({ ok: false, error: "Contact service is temporarily unavailable." });
    }
    if (!process.env.FROM_EMAIL) {
      console.error("Missing required email environment variable.");
      return res.status(500).json({ ok: false, error: "Contact service is temporarily unavailable." });
    }

    const subject = `New message from ${cleanName}`;
    const text = `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`;

    const { error } = await resend.emails.send({
      from: `Portfolio Contact <${process.env.FROM_EMAIL}>`,
      to: process.env.TO_EMAIL,
      reply_to: cleanEmail,
      subject,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ ok: false, error: "Email provider error." });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("Contact handler failed:", e);
    return res.status(500).json({ ok: false, error: "Server error." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));