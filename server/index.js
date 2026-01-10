import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://sudhir848.github.io",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.options("*", cors());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body ?? {};

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing fields." });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ ok: false, error: "Missing RESEND_API_KEY." });
    }
    if (!process.env.TO_EMAIL) {
      return res.status(500).json({ ok: false, error: "Missing TO_EMAIL." });
    }
    if (!process.env.FROM_EMAIL) {
      return res.status(500).json({ ok: false, error: "Missing FROM_EMAIL." });
    }

    const subject = `New message from ${name}`;
    const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;

    const { error } = await resend.emails.send({
      from: `Portfolio Contact <${process.env.FROM_EMAIL}>`,
      to: process.env.TO_EMAIL,
      reply_to: email,
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
