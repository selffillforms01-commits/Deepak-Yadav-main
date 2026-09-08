import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };
import { cert, getApps as getAdminApps, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import fs from 'fs';

// Initialize Firebase in Node environment for backend persistence
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firebaseAdminServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'firebase-service-account.json'),
        'utf8'
      )
    );

const firebaseAdminApp = getAdminApps().length
  ? getAdminApps()[0]
  : initializeAdminApp({
      credential: cert({
        projectId: firebaseAdminServiceAccount.project_id,
        clientEmail: firebaseAdminServiceAccount.client_email,
        privateKey: firebaseAdminServiceAccount.private_key,
      }),
    });

const adminAuth = getAdminAuth(firebaseAdminApp);
const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

const gmailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
  family: 4,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const app = express();

// Global CORS handling — same behavior for Registration and Forgot Password OTP
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

const PORT = Number(process.env.PORT || 3000);

app.use(express.json({
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// API ROUTES
// ==========================================



// 4. POST Verify Gemini API Key
app.post('/api/admin/gemini/test-key', async (req, res) => {
  try {
    const { geminiApiKey } = req.body;
    const apiKey = (geminiApiKey || process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a Gemini API Key to test connection.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: 'Respond with "OK" if active.',
});

    if (response && response.text) {
      return res.json({
        success: true,
        message: 'Gemini AI API Key verified successfully! Model gemini-3.6-flash is active and responding.',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Gemini API returned empty response. Please check your key permissions.',
      });
    }
  } catch (err: any) {
    console.error('[Server] Gemini Test Key Failed:', err);
    res.status(400).json({
      success: false,
      error: `Gemini Authentication Failed: ${err?.message || 'Invalid Gemini API Key'}. Please check key from Google AI Studio.`,
    });
  }
});

/* SFF PASSWORD RESET EMAIL OTP */

const passwordResetTokens = new Map<
  string,
  {
    email: string;
    expiresAt: number;
  }
>();
const passwordResetOtps = new Map<
  string,
  {
    otp: string;
    expiresAt: number;
    lastSentAt: number;
  }
>();

app.post('/api/auth/send-password-reset-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const existing = passwordResetOtps.get(email);
    const now = Date.now();

    if (existing && now - existing.lastSentAt < 30000) {
      return res.status(429).json({
        error: 'Please wait 30 seconds before requesting another OTP.'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    passwordResetOtps.set(email, {
      otp,
      expiresAt: now + 10 * 60 * 1000,
      lastSentAt: now,
    });

    const result = await gmailTransporter.sendMail({
      from: `"SFF <${process.env.SMTP_USER}>"`
      ,
      to: email,
      subject: 'SFF Password Reset OTP',
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
      `,
    });

    console.log(`Password reset OTP sent to ${email}: ${result.messageId}`);

    return res.json({
      success: true,
      message: 'OTP sent successfully to your email.'
    });
  } catch (error: any) {
    console.error('Password reset OTP send error:', error);
    return res.status(500).json({
      error: 'Unable to send OTP. Please try again.'
    });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const resetToken = String(req.body?.resetToken || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        error: 'Reset token and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.'
      });
    }

    const record = passwordResetTokens.get(resetToken);

    if (!record) {
      return res.status(400).json({
        error: 'Password reset session is invalid. Please start again.'
      });
    }

    if (Date.now() > record.expiresAt) {
      passwordResetTokens.delete(resetToken);
      return res.status(400).json({
        error: 'Password reset session has expired. Please request a new OTP.'
      });
    }

    const userRecord = await adminAuth.getUserByEmail(record.email);

    await adminAuth.updateUser(userRecord.uid, {
      password: newPassword,
    });

    passwordResetTokens.delete(resetToken);

    console.log(`Password changed successfully for ${record.email}`);

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error: any) {
    console.error('Password change error:', error);

    return res.status(500).json({
      error: 'Unable to change password. Please try again.'
    });
  }
});
app.post('/api/auth/verify-password-reset-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({
        error: 'Email and OTP are required.'
      });
    }

    const record = passwordResetOtps.get(email);

    if (!record) {
      return res.status(400).json({
        error: 'OTP not found. Please request a new OTP.'
      });
    }

    if (Date.now() > record.expiresAt) {
      passwordResetOtps.delete(email);
      return res.status(400).json({
        error: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP. Please enter the correct OTP.'
      });
    }

    passwordResetOtps.delete(email);

    const resetToken = crypto.randomBytes(32).toString('hex');

    passwordResetTokens.set(resetToken, {
      email,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken,
    });
  } catch (error: any) {
    console.error('Password reset OTP verification error:', error);
    return res.status(500).json({
      error: 'Unable to verify OTP. Please try again.'
    });
  }
});
/* SFF REGISTRATION EMAIL OTP */

const registrationOtps = new Map<
  string,
  { otp: string; expiresAt: number; lastSentAt: number }
>();

app.post('/api/auth/send-email-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    const now = Date.now();
    const existing = registrationOtps.get(email);

    if (existing && now - existing.lastSentAt < 30000) {
      return res.status(429).json({
        success: false,
        error: 'Please wait 30 seconds before requesting another OTP.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    registrationOtps.set(email, {
      otp,
      expiresAt: now + 10 * 60 * 1000,
      lastSentAt: now,
    });

    const result = await gmailTransporter.sendMail({
      from: `"SFF <${process.env.SMTP_USER}>"`,
      to: email,
      subject: 'SFF Registration Verification OTP',
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
      `,
    });

    return res.json({
      success: true,
      message: 'OTP sent successfully to your email address.',
    });

  } catch (err: any) {
    console.error('[Server] Registration Email OTP Failed:', err);

    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to send registration OTP.',
    });
  }
});


app.post('/api/auth/verify-email-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required.',
      });
    }

    const record = registrationOtps.get(email);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found. Please request a new OTP.',
      });
    }

    if (Date.now() > record.expiresAt) {
      registrationOtps.delete(email);

      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new OTP.',
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Incorrect OTP. Please enter the correct 6-digit OTP.',
      });
    }

    registrationOtps.delete(email);

    return res.json({
      success: true,
      verified: true,
      message: 'Email OTP verified successfully.',
    });

  } catch (err: any) {
    console.error('[Server] Registration Email OTP Verification Failed:', err);

    return res.status(500).json({
      success: false,
      error: err?.message || 'OTP verification failed.',
    });
  }
});



// 7. GET Payment Audit Logs for Admin Panel
app.get('/api/admin/payment-audit-logs', async (req, res) => {
  try {
    const snap = await getDocs(collection(db, 'payment_audit_logs'));
    const logs: any[] = [];
    snap.forEach((d) => {
      logs.push(d.data());
    });
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch audit logs' });
  }
});

// ==========================================
// VITE / STATIC SERVING MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] SFF Application Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();




























app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { prompt, language, context, history } = req.body;

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const languageInstruction =
      language === 'odia'
        ? 'Reply in simple Odia.'
        : language === 'hindi'
          ? 'Reply in simple Hindi.'
          : language === 'english'
            ? 'Reply in clear, simple English.'
            : 'Reply in natural Hindi-English (Hinglish).';

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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

    const reply = response.text || 'Sorry, AI assistant could not generate a response.';

    res.json({
      reply,
      source: 'gemini'
    });
  } catch (error) {
    console.error('AI assistant error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});












