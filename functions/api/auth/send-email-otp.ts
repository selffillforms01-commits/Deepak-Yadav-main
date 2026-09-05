import { connect } from "cloudflare:sockets";

interface Env {
  SFF_OTP_STORE: KVNamespace;
  SMTP_USER: string;
  SMTP_PASS: string;
}

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64(value: string): string {
  const bytes = encoder.encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

async function readSmtpResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>
): Promise<string> {
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      throw new Error("SMTP connection closed unexpectedly.");
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\r\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (/^\d{3} /.test(line)) {
        return line;
      }
    }
  }
}

async function smtpCommand(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  reader: ReadableStreamDefaultReader<Uint8Array>,
  command: string,
  expectedCodes: string[]
) {
  await writer.write(encoder.encode(command + "\r\n"));

  const response = await readSmtpResponse(reader);
  const code = response.substring(0, 3);

  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP error: ${response}`);
  }

  return response;
}

async function sendGmailOtp(
  to: string,
  otp: string,
  smtpUser: string,
  smtpPass: string
) {
  const socket = connect(
    {
      hostname: "smtp.gmail.com",
      port: 465,
    },
    {
      secureTransport: "on",
      allowHalfOpen: true,
    }
  );

  await socket.opened;

  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();

  try {
    const greeting = await readSmtpResponse(reader);

    if (!greeting.startsWith("220")) {
      throw new Error(`SMTP greeting failed: ${greeting}`);
    }

    await smtpCommand(
      writer,
      reader,
      "EHLO self-fill-forms.pages.dev",
      ["250"]
    );

    await smtpCommand(writer, reader, "AUTH LOGIN", ["334"]);

    await smtpCommand(
      writer,
      reader,
      base64(smtpUser),
      ["334"]
    );

    await smtpCommand(
      writer,
      reader,
      base64(smtpPass),
      ["235"]
    );

    await smtpCommand(
      writer,
      reader,
      `MAIL FROM:<${smtpUser}>`,
      ["250"]
    );

    await smtpCommand(
      writer,
      reader,
      `RCPT TO:<${to}>`,
      ["250", "251"]
    );

    await smtpCommand(writer, reader, "DATA", ["354"]);

    const message = [
      `From: "SELF FILL FORMS" <${smtpUser}>`,
      `To: ${to}`,
      "Subject: SFF Registration Verification OTP",
      "MIME-Version: 1.0",
      'Content-Type: text/html; charset="UTF-8"',
      "",
      "<html>",
      "<body>",
      "<h2>SELF FILL FORMS (SFF)</h2>",
      "<p>Your registration verification OTP is:</p>",
      `<h1>${otp}</h1>`,
      "<p>This OTP is valid for 10 minutes.</p>",
      "<p>Please do not share this OTP with anyone.</p>",
      "</body>",
      "</html>",
      ".",
    ].join("\r\n");

    await writer.write(encoder.encode(message + "\r\n"));

    const dataResponse = await readSmtpResponse(reader);

    if (!dataResponse.startsWith("250")) {
      throw new Error(`SMTP DATA failed: ${dataResponse}`);
    }

    await writer.write(encoder.encode("QUIT\r\n"));
  } finally {
    try {
      reader.releaseLock();
    } catch {}

    try {
      writer.releaseLock();
    } catch {}

    await socket.close();
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as { email?: string };

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email address is required.",
        }),
        { status: 400, headers }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Please enter a valid email address.",
        }),
        { status: 400, headers }
      );
    }

    if (!context.env.SMTP_USER || !context.env.SMTP_PASS) { console.error("[SFF] SMTP binding check:", JSON.stringify({ SMTP_USER: !!context.env.SMTP_USER, SMTP_PASS: !!context.env.SMTP_PASS }));
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email service is not configured.",
        }),
        { status: 500, headers }
      );
    }

    const key = "registration_otp:" + encodeURIComponent(email);

    const existingRaw =
      await context.env.SFF_OTP_STORE.get(key);

    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw);

        if (
          existing.lastSentAt &&
          Date.now() - Number(existing.lastSentAt) < 30000
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "Please wait 30 seconds before requesting another OTP.",
            }),
            { status: 429, headers }
          );
        }
      } catch {}
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const now = Date.now();

    await context.env.SFF_OTP_STORE.put(
      key,
      JSON.stringify({
        otp,
        expiresAt: now + 600000,
        lastSentAt: now,
      }),
      { expirationTtl: 600 }
    );

    try {
      await sendGmailOtp(
        email,
        otp,
        context.env.SMTP_USER,
        context.env.SMTP_PASS
      );
    } catch (smtpError) {
      console.error(
        "[SFF] Gmail SMTP OTP failed:",
        smtpError
      );

      await context.env.SFF_OTP_STORE.delete(key);

      return new Response(
        JSON.stringify({
          success: false,
          error: smtpError instanceof Error ? smtpError.message : String(smtpError),
        }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully to your email address.",
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("[SFF] Registration OTP error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers }
    );
  }
};

export const onRequestOptions: PagesFunction<Env> =
  async () => {
    return new Response(null, {
      status: 204,
      headers,
    });
  };







