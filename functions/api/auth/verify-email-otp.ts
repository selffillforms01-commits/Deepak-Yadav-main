interface Env {
  SFF_OTP_STORE: KVNamespace;
}

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as {
      email?: string;
      otp?: string;
    };

    const email = String(body.email || "").trim().toLowerCase();
    const otp = String(body.otp || "").trim();

    if (!email || !otp) {
      return new Response(JSON.stringify({
        success: false,
        error: "Email and OTP are required."
      }), { status: 400, headers });
    }

    const key = "registration_otp:" + encodeURIComponent(email);

    const record = await context.env.SFF_OTP_STORE.get(key, "json") as {
      otp?: string;
      expiresAt?: number;
    } | null;

    if (!record) {
      return new Response(JSON.stringify({
        success: false,
        error: "OTP not found. Please request a new OTP."
      }), { status: 400, headers });
    }

    if (!record.expiresAt || Date.now() > record.expiresAt) {
      await context.env.SFF_OTP_STORE.delete(key);

      return new Response(JSON.stringify({
        success: false,
        error: "OTP has expired. Please request a new OTP."
      }), { status: 400, headers });
    }

    if (record.otp !== otp) {
      return new Response(JSON.stringify({
        success: false,
        error: "Incorrect OTP. Please enter the correct 6-digit OTP."
      }), { status: 400, headers });
    }

    await context.env.SFF_OTP_STORE.delete(key);

    return new Response(JSON.stringify({
      success: true,
      verified: true,
      message: "Email OTP verified successfully."
    }), { status: 200, headers });

  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({
      success: false,
      error: "OTP verification failed."
    }), { status: 500, headers });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers });
};
