var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_genai = require("@google/genai");
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_vite = require("vite");
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "selffillforms-odisha1",
  appId: "1:353549556649:web:2a581a26bfb61660b382b8",
  apiKey: "AIzaSyD2dyhGKrMGSpyKyMM_XvNLNl3ZEvs06Vo",
  authDomain: "selffillforms-odisha1.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: "selffillforms-odisha1.firebasestorage.app",
  messagingSenderId: "353549556649",
  measurementId: "G-GDBM1ZRCYP",
  oAuthClientId: "510850073672-r1m22klrlijq3oh7apl6v32k9l40i1oe.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// server.ts
var import_app2 = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");
var import_fs = __toESM(require("fs"), 1);
import_dotenv.default.config();
var firebaseApp = !(0, import_app.getApps)().length ? (0, import_app.initializeApp)(firebase_applet_config_default) : (0, import_app.getApp)();
var firebaseAdminServiceAccountPath = import_path.default.join(
  process.cwd(),
  "firebase-service-account.json"
);
var firebaseAdminServiceAccount = JSON.parse(
  import_fs.default.readFileSync(firebaseAdminServiceAccountPath, "utf8")
);
var firebaseAdminApp = (0, import_app2.getApps)().length ? (0, import_app2.getApps)()[0] : (0, import_app2.initializeApp)({
  credential: (0, import_app2.cert)({
    projectId: firebaseAdminServiceAccount.project_id,
    clientEmail: firebaseAdminServiceAccount.client_email,
    privateKey: firebaseAdminServiceAccount.private_key
  })
});
var adminAuth = (0, import_auth.getAuth)(firebaseAdminApp);
var db = firebase_applet_config_default.firestoreDatabaseId && firebase_applet_config_default.firestoreDatabaseId !== "(default)" ? (0, import_firestore.getFirestore)(firebaseApp, firebase_applet_config_default.firestoreDatabaseId) : (0, import_firestore.getFirestore)(firebaseApp);
var gmailTransporter = import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
});
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT || 3e3);
app.use(import_express.default.json({
  limit: "10mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
app.post("/api/admin/gemini/test-key", async (req, res) => {
  try {
    const { geminiApiKey } = req.body;
    const apiKey = (geminiApiKey || process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Please enter a Gemini API Key to test connection."
      });
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: 'Respond with "OK" if active.'
    });
    if (response && response.text) {
      return res.json({
        success: true,
        message: "Gemini AI API Key verified successfully! Model gemini-3.6-flash is active and responding."
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Gemini API returned empty response. Please check your key permissions."
      });
    }
  } catch (err) {
    console.error("[Server] Gemini Test Key Failed:", err);
    res.status(400).json({
      success: false,
      error: `Gemini Authentication Failed: ${err?.message || "Invalid Gemini API Key"}. Please check key from Google AI Studio.`
    });
  }
});
var passwordResetTokens = /* @__PURE__ */ new Map();
var passwordResetOtps = /* @__PURE__ */ new Map();
app.post("/api/auth/send-password-reset-otp", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    const existing = passwordResetOtps.get(email);
    const now = Date.now();
    if (existing && now - existing.lastSentAt < 3e4) {
      return res.status(429).json({
        error: "Please wait 30 seconds before requesting another OTP."
      });
    }
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    passwordResetOtps.set(email, {
      otp,
      expiresAt: now + 10 * 60 * 1e3,
      lastSentAt: now
    });
    const result = await gmailTransporter.sendMail({
      from: `"SFF <${process.env.SMTP_USER}>"`,
      to: email,
      subject: "SFF Password Reset OTP",
      text: `Your SFF password reset OTP is ${otp}. This OTP is valid for 10 minutes. Do not share this OTP with anyone.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;">
          <h2 style="color:#0B3B8C;">SFF Password Reset</h2>
          <p>Your password reset verification OTP is:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#0B3B8C;padding:15px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for <b>10 minutes</b>.</p>
          <p style="color:#666;">Do not share this OTP with anyone.</p>
        </div>
      `
    });
    console.log(`Password reset OTP sent to ${email}: ${result.messageId}`);
    return res.json({
      success: true,
      message: "OTP sent successfully to your email."
    });
  } catch (error) {
    console.error("Password reset OTP send error:", error);
    return res.status(500).json({
      error: "Unable to send OTP. Please try again."
    });
  }
});
app.post("/api/auth/change-password", async (req, res) => {
  try {
    const resetToken = String(req.body?.resetToken || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        error: "Reset token and new password are required."
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long."
      });
    }
    const record = passwordResetTokens.get(resetToken);
    if (!record) {
      return res.status(400).json({
        error: "Password reset session is invalid. Please start again."
      });
    }
    if (Date.now() > record.expiresAt) {
      passwordResetTokens.delete(resetToken);
      return res.status(400).json({
        error: "Password reset session has expired. Please request a new OTP."
      });
    }
    const userRecord = await adminAuth.getUserByEmail(record.email);
    await adminAuth.updateUser(userRecord.uid, {
      password: newPassword
    });
    passwordResetTokens.delete(resetToken);
    console.log(`Password changed successfully for ${record.email}`);
    return res.json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({
      error: "Unable to change password. Please try again."
    });
  }
});
app.post("/api/auth/verify-password-reset-otp", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const otp = String(req.body?.otp || "").trim();
    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required."
      });
    }
    const record = passwordResetOtps.get(email);
    if (!record) {
      return res.status(400).json({
        error: "OTP not found. Please request a new OTP."
      });
    }
    if (Date.now() > record.expiresAt) {
      passwordResetOtps.delete(email);
      return res.status(400).json({
        error: "OTP has expired. Please request a new OTP."
      });
    }
    if (record.otp !== otp) {
      return res.status(400).json({
        error: "Invalid OTP. Please enter the correct OTP."
      });
    }
    passwordResetOtps.delete(email);
    const resetToken = import_crypto.default.randomBytes(32).toString("hex");
    passwordResetTokens.set(resetToken, {
      email,
      expiresAt: Date.now() + 10 * 60 * 1e3
    });
    return res.json({
      success: true,
      message: "OTP verified successfully.",
      resetToken
    });
  } catch (error) {
    console.error("Password reset OTP verification error:", error);
    return res.status(500).json({
      error: "Unable to verify OTP. Please try again."
    });
  }
});
var registrationOtps = /* @__PURE__ */ new Map();
app.post("/api/auth/send-email-otp", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email address is required."
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address."
      });
    }
    const now = Date.now();
    const existing = registrationOtps.get(email);
    if (existing && now - existing.lastSentAt < 3e4) {
      return res.status(429).json({
        success: false,
        error: "Please wait 30 seconds before requesting another OTP."
      });
    }
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    registrationOtps.set(email, {
      otp,
      expiresAt: now + 10 * 60 * 1e3,
      lastSentAt: now
    });
    const result = await gmailTransporter.sendMail({
      from: `"SFF <${process.env.SMTP_USER}>"`,
      to: email,
      subject: "SFF Registration Verification OTP",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
          <h2 style="color:#0b3b8c">SELF FILL FORMS (SFF)</h2>
          <p>Your registration verification OTP is:</p>

          <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
            padding:18px;
            background:#f4f6f8;
            border-radius:12px;
            text-align:center;
            margin:20px 0;
          ">
            ${otp}
          </div>

          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this OTP, please ignore this email.</p>

          <hr />

          <p style="color:#666;font-size:13px">
            This is an automated email from SELF FILL FORMS (SFF).
          </p>
        </div>
      `
    });
    return res.json({
      success: true,
      message: "OTP sent successfully to your email address."
    });
  } catch (err) {
    console.error("[Server] Registration Email OTP Failed:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to send registration OTP."
    });
  }
});
app.post("/api/auth/verify-email-otp", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const otp = String(req.body?.otp || "").trim();
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required."
      });
    }
    const record = registrationOtps.get(email);
    if (!record) {
      return res.status(400).json({
        success: false,
        error: "OTP not found. Please request a new OTP."
      });
    }
    if (Date.now() > record.expiresAt) {
      registrationOtps.delete(email);
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new OTP."
      });
    }
    if (record.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Incorrect OTP. Please enter the correct 6-digit OTP."
      });
    }
    registrationOtps.delete(email);
    return res.json({
      success: true,
      verified: true,
      message: "Email OTP verified successfully."
    });
  } catch (err) {
    console.error("[Server] Registration Email OTP Verification Failed:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "OTP verification failed."
    });
  }
});
app.get("/api/admin/payment-audit-logs", async (req, res) => {
  try {
    const snap = await (0, import_firestore.getDocs)((0, import_firestore.collection)(db, "payment_audit_logs"));
    const logs = [];
    snap.forEach((d) => {
      logs.push(d.data());
    });
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch audit logs" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] SFF Application Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { prompt, language, context, history } = req.body;
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const languageInstruction = language === "odia" ? "Reply in simple Odia." : language === "hindi" ? "Reply in simple Hindi." : language === "english" ? "Reply in clear, simple English." : "Reply in natural Hindi-English (Hinglish).";
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${languageInstruction}

You are the SFF AI Assistant for SELF FILL FORMS.
Help the user understand and complete government-service forms.
Do not invent application status, fees, eligibility, or official information.
Do not ask for or expose OTPs, passwords, API keys, or other sensitive credentials.

User question:
${prompt}

Current context:
${JSON.stringify(context || {})}

Previous conversation:
${JSON.stringify(history || [])}`
    });
    const reply = response.text || "Sorry, AI assistant could not generate a response.";
    res.json({
      reply,
      source: "gemini"
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});
//# sourceMappingURL=server.cjs.map
