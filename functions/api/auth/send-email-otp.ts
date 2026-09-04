interface Env {
  SFF_OTP_STORE: KVNamespace;
  RESEND_API_KEY: string;
}

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { email?: string };
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        error: "Email address is required."
      }), { status: 400, headers });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = "registration_otp:" + encodeURIComponent(email);

    await context.env.SFF_OTP_STORE.put(
      key,
      JSON.stringify({
        otp,
        expiresAt: Date.now() + 600000,
        lastSentAt: Date.now()
      }),
      { expirationTtl: 600 }
    );

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + context.env.RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "SELF FILL FORMS <onboarding@resend.dev>",
        to: [email],
        subject: "SFF Registration Verification OTP",
        html: "<h2>SELF FILL FORMS (SFF)</h2><p>Your registration verification OTP is:</p><h1>" + otp + "</h1><p>This OTP is valid for 10 minutes.</p>"
      })
    });

    if (!response.ok) {
      await context.env.SFF_OTP_STORE.delete(key);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to send registration OTP."
      }), { status: 500, headers });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "OTP sent successfully to your email address."
    }), { status: 200, headers });

  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({
      success: false,
      error: "Failed to send registration OTP."
    }), { status: 500, headers });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers });
};
